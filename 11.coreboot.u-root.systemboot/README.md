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

This command will generate a ramfs named `/tmp/initramfs_${os}_${arch}.cpio`, e.g. `/tmp/initramfs_linux_amd64.cpio`. You can specify an alternative output path with `-o`. Run `u-root -h` for additional command line parameters.

Note: the above command will include only pure-Go commands from `u-root` and `systemboot`. If you need to include other files or non-Go binaries, use the `-file` option in `u-root`.
For example, you may want to include static builds of `kexec` or `flashrom`, that we build on https://github.com/systemboot/binaries .

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

Some more information about tiny configs can be found at https://tiny.wiki.kernel.org (last checked 2018-12-01).

### Requirements for Go 1.11

`Go` requires a few kernel features to work properly. At the time of writing,
you need to enable `CONFIG_FUTEX` in your kernel config.

Additional information about Go's minimum requirements can be found at
https://github.com/golang/go/wiki/MinimumRequirements (last checked 2018-12-01).


### Enable devtmpfs

Our system firmware uses u-root, which does not have (intentionally) an `udev` equivalent. Therefore, to have `/dev/` automatically populated at boot time you should enable devtmps.

Simply enable `CONFIG_DEVTMPFS` and `CONFIG_DEVTMPFS_MOUNT` in your kernel config


### Additional drivers

This really depends on your hardware. You may want to add all the relevant
drivers for the platforms you plan to run LinuxBoot on. For example you may need
to include NIC drivers, file system drivers, and any other device that you need
at boot time.

### Enable XZ compression support

The `u-root`-based RAMFS will be compressed with XZ and embedded in the kernel.
Hence you need to enable XZ compression support. Make sure to have at least
`CONFIG_HAVE_KERNEL_XZ`, `CONFIG_KERNEL_XZ`, `CONFIG_DECOMPRESS_XZ`.

### Enable VPD

VPD stands for [Vital Product Data](https://chromium.googlesource.com/chromiumos/platform/vpd/+/1c1806d8df4bb5976eed71a2e2bf156c36ccdce2/README.md).
We use VPD to store boot configuration for `systemboot`, similarly to UEFI's boot variables.
Linux supports VPD out of the box, but you need at least a kernel 4.16.

Make sure to have `CONFIG_GOOGLE_VPD` enabled in your kernel config.


### TPM support

This also depends on your needs. If you plan to use TPM, and this is supported
by your platform, make sure to enable `CONFIG_TCG_TPM`.


### Include the initramfs

As mentioned above, the kernel will embed the compressed initramfs image. Your
kernel configuration should point to the appropriate file using the
`CONFIG_INITRAMFS_SOURCE` directive. E.g.

```
CONFIG_INITRAMFS_SOURCE=/patp/to/initramfs_linux.x86_64.cpio.xz`
```

### Default hostname

We use "linuxboot" as default hostname. You may want to adjust it to a different
value, You need to set `CONFIG_DEFAULT_HOSTNAME` for the purpose, e.g.

```
CONFIG_DEFAULT_HOSTNAME="linuxboot"
```


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
