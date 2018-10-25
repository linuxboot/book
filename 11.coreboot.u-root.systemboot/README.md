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

TODO

## Building coreboot

TODO

## Putting everything together

TODO

## Run on a virtual machine

TODO

## Run on real OCP hardware

TODO
