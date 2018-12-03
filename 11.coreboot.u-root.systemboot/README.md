# LinuxBoot using coreboot, u-root and systemboot

Points of contact: [Andrea Barberio](https://github.com/insomniacslk), [David Hendricks](https://github.com/dhendrix)

This chapter describes how to build a LinuxBoot firmware based on coreboot, u-root and systemboot.
The examples will focus on x86_64, and the coreboot builds will cover virtual and physical OCP hardware.

## Components

The final image is built on top of multiple open-source components:

* [coreboot](https://coreboot.org), used for the platform initialization. Silicon and DRAM initialization are done here.
* [Linux](https://kernel.org), used to initialize peripherals and various device drivers like file systems, storage and network devices; network stack; a multiuser and multitasking environment.
* [u-root](https://u-root.tk), an user-space environment that provides basic libraries and utilities to work in a Linux environment.
* [systemboot](https://systemboot.org), an additional set of libraries and tools on top of u-root, that provide a bootloader behaviour for various booting scenarios.

These components are built in reverse order. `u-root` and `systemboot` are built together in a single step.

## Building u-root and systemboot

The first step is building the initramfs. This is done using the `u-root` ramfs builder, with additional tools and libraries from `systemboot`.

Both `u-root` and `systemboot` are written in Go. We recommend using a relatively recent version of Go. At the time of writing the latest is 1.11, and we recommend using at least version 1.10. Previous versions may not be fully supported.

Adjust your `PATH` to include `${GOPATH}/bin`, in order to find the `u-root` command that we will use in the next steps.

Then, fetch `u-root`, `systemboot` and their dependencies:
```
go get -u github.com/u-root/u-root
go get -u github.com/systemboot/systemboot/{uinit,localboot,netboot}
```

Then build the ramfs in busybox mode:
```
u-root -build=bb core \
    github.com/systemboot/systemboot/{uinit,localboot,netboot}
```

This command will generate a ramfs named `/tmp/initramfs_${os}_${arch}.cpio`, e.g. `/tmp/initramfs.linux_amd64.cpio`. You can specify an alternative output path with `-o`. Run `u-root -h` for additional command line parameters.

Note: the above command will include only pure-Go commands from `u-root` and `systemboot`. If you need to include other files or non-Go binaries, use the `-file` option in `u-root`.
For example, you may want to include static builds of `kexec` or `flashrom`, that we build on https://github.com/systemboot/binaries .

Then, the initramfs has to be compressed. This step is necessary to embed the
initramfs in the kernel as explained below, in order to maintain the image size
smaller. Linux has a limited XZ compressor, so the compression requires specific
options:

```
xz --check=crc32 --lzma2=dict=512KiB /tmp/initramfs.linux_amd64.cpio
```

which will produce the file `/tmp/initramfs.linux_amd64.cpio.xz`.

The kernel compression requirements are documented under
[Documentation/xz.txt](https://www.kernel.org/doc/Documentation/xz.txt) (last checked 2018-12-03)
in the kernel docs.

## Building a suitable Linux kernel

TODO add sample `.config`.

You need a relatively recent kernel. Ideally a kernel 4.16, to have support for VPD variables, but a 4.11 can do the job too, if you don't care about boot entries and want "brute-force" booting only.

We will build a kernel with the following properties:

* small enough to fit most flash chips
* that can run Go programs (mainly futex and epoll support)
* with the relevant storage and network drivers
* with kexec support, so it can boot a new kernel
* with kexec signature verification disabled (optional)
* with devtmpfs enabled, since we don't use udev
* XZ support to decompress the embedded initramfs
* VPD (Vital Product Data) (optional)
* TPM support (optional)
* embed the u-root initramfs
* and last but not least, "linuxboot" as default host name :)


### Download kernel sources

You can either download a tarball from kernel.org, or get it via git and use a
version tag. We recommend at least a kernel 4.16, in order to have VPD variables
support.

```
# download the kernel tarball. Replace 4.19.6` with whatever kernel version you want
wget https://cdn.kernel.org/pub/linux/kernel/v4.x/linux-4.19.6.tar.xz
tar xvJf linux-4.19.6.tar.xz
cd linux-4.19.6
make tinyconfig
```

You can also check out the `linux-stable` branch, that will point to the latest stable commit. You need to download it via `git` as follows:
```
git clone --depth 1 -b linux-stable
git://git.kernel.org/pub/scm/linux/kernel/git/stable/linux-stable.git
cd linux-stable
make tinyconfig
```

Some more information about tiny configs can be found at https://tiny.wiki.kernel.org (last checked 2018-12-01).

### Requirements for Go 1.11

`Go` requires a few kernel features to work properly. At the time of writing,
you need to enable `CONFIG_FUTEX` in your kernel config.
Older versions of Go may require `CONFIG_EPOLL`.

In menuconfig:

* `General setup` &rarr; `Configure standard kernel features (expert users)` &rarr; `Enable futex support`
* `General setup` &rarr; `Configure standard kernel features (expert users)` &rarr; `Enable eventpoll support`

Additional information about Go's minimum requirements can be found at
https://github.com/golang/go/wiki/MinimumRequirements (last checked 2018-12-01).


### Enable devtmpfs

Our system firmware uses u-root, which does not have (intentionally) an `udev` equivalent. Therefore, to have `/dev/` automatically populated at boot time you should enable devtmps.

Simply enable `CONFIG_DEVTMPFS` and `CONFIG_DEVTMPFS_MOUNT` in your kernel config

In menuconfig:

* `Device drivers` &rarr; `Generic Driver Options` &rarr; `Maintain a devtmpfs filesystem to mount at /dev`
* `Device drivers` &rarr; `Generic Driver Options` &rarr; `Automount devtmpfs at /dev, after the kernel mounted the rootfs`


### Additional drivers

This really depends on your hardware. You may want to add all the relevant
drivers for the platforms you plan to run LinuxBoot on. For example you may need
to include NIC drivers, file system drivers, and any other device that you need
at boot time.

For example, enable SCSI disk, SATA drivers, EXT4, and e1000 NIC driver. In menuconfig:

* `Bus options` &rarr; `PCI support`
* `Device drivers` &rarr; `Block devices` (required for SCSI and SATA)
* `Device drivers` &rarr; `SCSI device support` &rarr; `SCSI disk support`
* `Device drivers` &rarr; `Serial ATA and Parallel ATA drivers`
* `File systems` &rarr; `The Extended 4 (ext4) filesystem`
* `Networking support` (required for e1000)
* `Device drivers` &rarr; `Network device support` &rarr; `Ethernet driver support` &rarr; `Intel(R) PRO/1000 Gigabit Ethernet support`

### Enable XZ kernel and initramfs compression support

The `u-root`-based RAMFS will be compressed with XZ and embedded in the kernel.
Hence you need to enable XZ compression support. Make sure to have at least
`CONFIG_HAVE_KERNEL_XZ`, `CONFIG_KERNEL_XZ`, `CONFIG_DECOMPRESS_XZ`.

In menuconfig:

* `General setup` &rarr; `Kernel compression mode` &rarr; `XZ`
* `General setup` &rarr; `Initial RAM filesystem and RAM disk (initramfs/initrd) support` &rarr; `Support initial ramdisk/ramfs compressed using XZ`

### Enable VPD

VPD stands for [Vital Product Data](https://chromium.googlesource.com/chromiumos/platform/vpd/+/1c1806d8df4bb5976eed71a2e2bf156c36ccdce2/README.md).
We use VPD to store boot configuration for `systemboot`, similarly to UEFI's boot variables.
Linux supports VPD out of the box, but you need at least a kernel 4.16.

Make sure to have `CONFIG_GOOGLE_VPD` enabled in your kernel config.

In menuconfig:

* `Firmware drivers` &rarr; `Google Firmware Drivers` &rarr; `Coreboot Table Access - ACPI` &rarr; `Vital Product Data`


### TPM support

This also depends on your needs. If you plan to use TPM, and this is supported
by your platform, make sure to enable `CONFIG_TCG_TPM`.

In menuconfig:

* `Device drivers` &rarr; `Character devices` &rarr; `TPM Hardware Support` &rarr; (enable the relevant drivers)


### Include the initramfs

As mentioned above, the kernel will embed the compressed initramfs image. Your
kernel configuration should point to the appropriate file using the
`CONFIG_INITRAMFS_SOURCE` directive. E.g.

```
CONFIG_INITRAMFS_SOURCE="/path/to/initramfs_linux.x86_64.cpio.xz"`
```

In menuconfig:

* `General setup` &rarr; `Initial RAM filesystem and RAM disk (initramfs/initrd) support` &rarr; `Initramfs source file(s)`

### Default hostname

We use "linuxboot" as default hostname. You may want to adjust it to a different
value, You need to set `CONFIG_DEFAULT_HOSTNAME` for the purpose, e.g.

```
CONFIG_DEFAULT_HOSTNAME="linuxboot"
```

In menuconfig:

* `General setup` &rarr; `Default hostname`


### Build the kernel

Once your configuration is ready, build the kernel as usual:

```
make -j$(nproc --ignore=1)
```

The image will be located under `arch/${ARCH}/boot/bzImage` if your architecture supports bzImage (e.g. x86).

For more details on how to build a kernel, see https://kernelnewbies.org/KernelBuild (last checked 2018-12-01).

## Building coreboot

TODO

## Putting everything together

TODO

## Defining boot entries

TODO

## Running on a virtual machine

TODO

## Running on real OCP hardware

TODO
