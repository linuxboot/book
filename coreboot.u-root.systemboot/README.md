# LinuxBoot using coreboot, u-root and systemboot

Points of contact: [Andrea Barberio](https://github.com/insomniacslk), [David Hendricks](https://github.com/dhendrix)

This chapter describes how to build a LinuxBoot firmware based on coreboot, u-root and systemboot.
The examples will focus on `x86_64`, and the coreboot builds will cover virtual and physical OCP hardware.

## Quick Start with coreboot

Run these commands in a directory you create or in /tmp; do so because it creates some files and directories:

	$ go get github.com/linuxboot/corebootnerf
	$ go run github.com/linuxboot/corebootnerf --fetch 
	... lots and lots of output!

This produces a coreboot image in coreboot-4.9/build/coreboot.rom
You can now run this rom image:

	$  qemu-system-x86_64 -serial stdio -bios coreboot-4.9/build/coreboot.rom

And see how it looks when you put this in a coreboot ROM image.

## Components

The final image is built on top of multiple open-source components:

* [coreboot](https://coreboot.org), used for the platform initialization. Silicon and DRAM initialization are done here.
* [Linux](https://kernel.org), used to initialize peripherals and various device drivers like file systems, storage and network devices; network stack; a multiuser and multitasking environment.
* [u-root](https://github.com/u-root/u-root), an user-space environment that provides basic libraries and utilities to work in a Linux environment.
* ~~[systemboot](https://systemboot.org), an additional set of libraries and tools on top of u-root, that provide a bootloader behaviour for various booting scenarios.~~ systemboot was merged into u-root.

These components are built in reverse order. `u-root` and `systemboot` are built together in a single step.

## Building u-root

The first step is building the initramfs. This is done using the `u-root` ramfs builder, with additional tools and libraries from `systemboot`.

u-root is written in Go. We recommend using a relatively recent version of the Go toolchain. At the time of writing the latest is 1.11, and we recommend using at least version 1.10. Previous versions may not be fully supported.

Adjust your `PATH` to include `${GOPATH}/bin`, in order to find the `u-root` command that we will use in the next steps.

Then, fetch `u-root` and its dependencies:
```
go get -u github.com/u-root/u-root
```

Then build the ramfs in busybox mode, and add fbnetboot, localboot, and a custom
uinit to wrap everything together:
```
u-root -build=bb core github.com/u-root/u-root/cmds/boot/{uinit,localboot,fbnetboot}
```

This command will generate a ramfs named `/tmp/initramfs_${os}_${arch}.cpio`, e.g. `/tmp/initramfs.linux_amd64.cpio`. You can specify an alternative output path with `-o`. Run `u-root -h` for additional command line parameters.

Note: the above command will include only pure-Go commands from `u-root`. If you need to include other files or non-Go binaries, use the `-file` option in `u-root`.
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

A sample config to use with Qemu can be downloaded here: [linux-4.19.6-linuxboot.config](linux-4.19.6-linuxboot.config).

You need a relatively recent kernel. Ideally a kernel 4.16, to have support for VPD variables, but a 4.11 can do the job too, if you don't care about boot entries and want "brute-force" booting only.

We will build a kernel with the following properties:

* small enough to fit most flash chips, and with some fundamental kernel features
* that can run Go programs (mainly futex and epoll support)
* with the relevant storage and network stack and drivers
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

### A few fundamental features

Assuming we are running on `x86_64`, some basic features to enable are:

* `64-bit kernel`
* `General setup` &rarr; `Configure standard kernel features` &rarr; `Enable support for printk`
* `General setup` &rarr; `Configure standard kernel features` &rarr; `Multiple users, groups and capabilities support` (this is not strictly required on LinuxBoot)
* `Processor type and features` &rarr; `Built-in kernel command line` (customize your command line here if needed, e.g. `earlyprintk=serial,ttyS0,57600 console=ttyS0,57600`)
* `Executable file formats / Emulations` &rarr; `Kernel support for ELF binaries` (you may want to enable more formats)
* `Networking support` &rarr; `Networking options` &rarr; `TCP/IP networking`
* `Networking support` &rarr; `Networking options` &rarr; `The IPv6 protocol`
* `Device Drivers` &rarr; `Character devices` &rarr; `Enable TTY`
* `Device Drivers` &rarr; `Character devices` &rarr; `Serial drivers` &rarr; `8250/16550 and compatible serial support`
* `Device Drivers` &rarr; `Character devices` &rarr; `Serial drivers` &rarr; `Console on 8250/16550 and compatible serial port`
* `File systems` &rarr; `Pseudo filesystems` &rarr; `/proc file system support`
* `File systems` &rarr; `Pseudo filesystems` &rarr; `sysfs file system support`


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
* `Enable the block layer`
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
We use VPD to store boot configuration for `localboot` and `fbnetboot`, similarly to UEFI's boot variables.
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

In this step we will build `coreboot` using the Linux kernel image that we built
at the previous step as payload. This build is for a Qemu x86 target, the process
may be somehow different for other platforms.

Steps overview:

* download coreboot from the git repo
* build the compiler toolchain
* configure coreboot for Qemu, and to use our `bzImage` as payload
* build `coreboot.rom`


### Download coreboot

Our preferred method is to download coreboot from the git repository:

```
git clone https://review.coreboot.org/coreboot.git
cd coreboot
```

### Build the compiler toolchain

This step is required to have, among other things, reproducible builds, and a
compiler toolchain that is known to work with coreboot.

```
make crossgcc-i386 CPUS=$(nproc) BUILD_LANGUAGES=c
```

The step above may ask you to install a few additional libraries or headers, do
so as requested, with the exception of gcc-gnat, that we won't need.


### Configure coreboot for Qemu and our payload

Run `make menuconfig` to enter the coreboot configuration menus. Then:

Specify the platform we will run on:

* `Mainboard` &rarr; `Mainboard vendor` &rarr; `Emulation`
* `Mainboard` &rarr; `Mainboard Model` &rarr; `QEMU x86 q35/ich9 (aka qemu -M q35, since v1.4)`

Specify a large enough flash chip and CBFS size:

* `Mainboard` &rarr; `ROM chip size` &rarr; `16 MB`
* `Mainboard` &rarr; `Size of CBFS filesystem in ROM` &rarr; `0x1000000`

Specify our payload:

* `Payload` &rarr; `Add a payload` &rarr; `A Linux payload`
* `Payload` &rarr; `Linux path and filename` &rarr; path to your bzImage


Then save your configuration and exit menuconfig.

### Build coreboot

This is done with a simple

```
make -j$(nproc)
```

The coreboot build system will clone the relevant submodules, if it was not done
already, and will build a coreboot ROM file that will contain the initialization
code, and our bzImage payload. The output file is at `build/coreboot.rom`.

If everything works correctly you will get an output similar to the following:
```
This image contains the following sections that can be manipulated with this tool:

'COREBOOT' (CBFS, size 16776704, offset 512)

It is possible to perform either the write action or the CBFS add/remove actions on every section listed above.
To see the image's read-only sections as well, rerun with the -w option.
    CBFSPRINT  coreboot.rom

FMAP REGION: COREBOOT
Name                           Offset     Type           Size   Comp
cbfs master header             0x0        cbfs header        32 none
fallback/romstage              0x80       stage           15300 none
fallback/ramstage              0x3cc0     stage           51805 none
config                         0x10780    raw               155 none
revision                       0x10880    raw               576 none
cmos_layout.bin                0x10b00    cmos_layout       548 none
fallback/dsdt.aml              0x10d80    raw              6952 none
fallback/payload               0x12900    simple elf    5883908 none
(empty)                        0x5af140   null         10800216 none
bootblock                      0xffbdc0   bootblock       16384 none

Built emulation/qemu-q35 (QEMU x86 q35/ich9)
```

## Putting everything together

TODO

## Defining boot entries

TODO

## Running on a virtual machine

The image built with the above steps can run on a QEMU virtual machine, using
the machine type `q35`, as specified in the coreboot mainboard section. Assuming
that your coreboot image is located at `build/coreboot.rom`, you can
run the following command:

```
sudo qemu-system-x86_64\        # sudo is required to enable KVM below
    -M q35 \                    # the machine type specified in the coreboot mainboard configuration
    -enable-kvm \               # use KVM to avail of hardware virtualization extensions
    -bios build/coreboot.rom \  # the coreboot ROM to run as system firmware
    -m 1024 \                   # the amount of RAM in MB
    -object rng-random,filename=/dev/urandom,id=rng0 \
                                # RNG to avoid DHCP lockups when waiting for entropy
    -nographic                  # redirect all the output to the console
```

If everything has been done correctly you should see, in order, the output from
`coreboot`, `linux`, `u-root`, and `systemboot`. You can press `ctrl-c` when
Systemboot instructs you to do so, to enter the `u-root` shell.


## Running on real OCP hardware

TODO
