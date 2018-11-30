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


Steps:
* create a minimal configuration, see https://tiny.wiki.kernel.org
* enable `CONFIG_FUTEX` and `CONFIG_EPOLL`, required by Go, see https://github.com/golang/go/wiki/MinimumRequirements
* enable `CONFIG_DEVTMPFS` and `CONFIG_DEVTMPFS_MOUNT`, to populate /dev
* enable relevant storage and network drivers. This depends on your platforms
* enable XZ (`CONFIG_HAVE_KERNEL_XZ`, `CONFIG_KERNEL_XZ`, `CONFIG_DECOMPRESS_XZ`) required to handle the compressed initramfs
* enable VPD (Vital Product Data) used for boot variables by Systemboot
* enable TPM support, if you use it, `CONFIG_TCG_TPM`
* point `CONFIG_INITRAMFS_SOURCE` to the path where your compressed initramfs lives (e.g. `/path/to/initramfs.xz`)
* change default hostname, `CONFIG_DEFAULT_HOSTNAME="linuxboot"`

Then simply build as usual (see https://kernelnewbies.org/KernelBuild if you need more details).

The image will be located under `arch/${ARCH}/boot/bzImage` if your architecture supports bzImage (e.g. x86).

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
