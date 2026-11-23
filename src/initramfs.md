# Initial RAM File System (initramfs)

When Linux boots, it needs a root file system[^1] that provides boot and startup
utilities. In LinuxBoot, it is embedded as an initramfs within the firmware
image itself. It is intended to be placed in a flash device along with the
Linux kernel as part of the firmware image for LinuxBoot. The initramfs is
essentially a set of files and directories bundled into a single cpio archive.

> [!WARNING]
>
> The legacy _initrd_[^2] is no longer recommended. It is/was a block device
> based initial root file system.

The minimum structure is this:

```text
/dev/console
/dev/null
/init
/proc/
/sys/
```

At boot time, the boot loader or firmware (for example, coreboot) loads the
kernel image and initramfs into memory and starts the kernel. The kernel checks
for the presence of the initramfs and, if found, unpacks it, mounts it as `/`
and runs `/init`. Should any of those steps fail, then the kernel will print a
["No working init found." error](https://docs.kernel.org/admin-guide/init.html).

From there on, you are free to design every further flow. Technically, `init`
by itself suffices, since it could create the directory structure and the
essential device nodes by itself, mount the procfs and sysfs, and set up
everything else you need. In other words, it can remain a single binary, or you
add other binaries and invoke them. It might also be a symlink, possibly to a
BusyBox-style binary.

> [!TIP]
>
> You may concatenate multiple cpio archives[^3] into one initramfs.

## Build methods

There are many tools to generate an initramfs. Below is a growing list of
readily available ones.

Besides passing a custom `.cpio` file, the Linux kernel source tree offers its
own tool[^5] to build an initramfs from a given set of files and directories.

## u-root

The u-root repository contains an initramfs build tool as well as a user-space
(programs and libraries used to interact with the kernel) written in Go.
It contains a toolset of standard Linux applications and commands.

u-root can create an initramfs with one BusyBox-like binary comprising all the
requested utilities (bb).

Historically, there was also a source mode, which contained:

* Go toolchain binaries
* A simple shell
* Go source for tools to be compiled on the fly by the shell

The initramfs provided by u-root implements the toolchain needed to securely
boot the machine from the network, perform identity verification, communicate
with different internal boot-related components, and kexec the next kernel.

u-root is an open source project hosted on GitHub[^4]. Within the u-root
repository, we have executable commands in `cmds` and the packages containing
libraries and implementations in `pkg`.

## Booster

Booster[^6] builds an optimized initramfs for the system it is run on by
detecting parameters from the running system, or alternatively a more generic
initramfs when passing `--universal`. It includes TPM2 and FIDO2 token support.

For LinuxBoot, since you may want to kexec into another kernel, Booster is not
directly suitable. Since it is written in Go, its utilities can be combined with
u-root.

Booster describes itself as
> a fast, compact, Go-based initramfs generator with strong encrypted-boot
> ergonomics and automatic host discovery

## 3cpio

3cpio[^7] is an initramfs management utility. It allows for creating, examining
and extracting initramfs cpio archives.

[^1]: <https://docs.kernel.org/filesystems/ramfs-rootfs-initramfs.html>
[^2]: <https://docs.kernel.org/admin-guide/initrd.html>
[^3]: <https://docs.kernel.org/driver-api/early-userspace/buffer-format.html>
[^4]: <https://github.com/u-root/u-root/>
[^5]:
    <https://docs.kernel.org/driver-api/early-userspace/early_userspace_support.html>
[^6]: <https://github.com/anatol/booster>
[^7]: <https://github.com/bdrung/3cpio>
