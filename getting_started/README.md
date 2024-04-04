# Getting Started

You can try out LinuxBoot without needing to build anything! You can try out LinuxBoot
needing only 3 commands.

We have made Initial Ram File System (initramfs) images available for four architectures:
arm, aarch64, amd64 (a.k.a. x86_64), and riscv64.

For now, we only have a kernel ready for x86_64, so the instructions below apply to that.

First, you can get the initramfs image, which mainly contains Go programs from the u-root project.

```
curl -L -o u-root.cpio.xz https://github.com/linuxboot/u-root-builder/releases/download/v0.0.1/u-root_amd64_all.cpio.xz
```

Next, you will need to get a kernel. We use a pre-built kernel from Arch Linux.

```
curl -L -o linux.tar.zst https://archlinux.org/packages/core/x86_64/linux/download/
tar -xf linux.tar.zst
```

Now you are ready to test LinuxBoot out.

```
qemu-system-x86_64 -enable-kvm -machine q35 -nographic -append "console=ttyS0" \
  -kernel usr/lib/modules/*/vmlinuz -initrd u-root.cpio.xz
```

Or, for example, on Darwin:
```
qemu-system-x86_64 -machine q35 -nographic -append "console=ttyS0" \
  -kernel usr/lib/modules/*/vmlinuz -initrd u-root.cpio.xz
```


You will see the following:
```
[... varying message or two depending on qemu version and OS]
2023/12/12 22:37:52 Welcome to u-root!
                              _
   _   _      _ __ ___   ___ | |_
  | | | |____| '__/ _ \ / _ \| __|
  | |_| |____| | | (_) | (_) | |_
   \__,_|    |_|  \___/ \___/ \__|

/#
```

You can type uname:

```
/# uname
Linux
/#
```

To exit qemu, just run the poweroff command:

```
/# poweroff
[   14.442914] reboot: Power down
```

You have just run your first LinuxBoot kernel.
