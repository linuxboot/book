# Evaluation of tools

Three general questions guide all software projects:

- what exists already? (implementations, tools and build systems)
- what needs development? (UIs and such)
- what is a good environment? (build + runtime)

Not only do we want to answer those questions. We also keep track of the options
and decision process in this book in order for readers to make sense.

There are many existing tools already that we can leverage to implement the idea
of using Linux to boot into an operating system.

## Root filesystem

Linux needs a root filesystem with at least one binary that is called
[`init`](https://docs.kernel.org/admin-guide/init.html). Since booting a system
is a cumbersome task, additional tools aid in both development and investigating
possible issues.

### Core utilities

Unix already came with lots of little utilities for the user of the system,
which may be anyone from a system developer to an administrator of a shared or
provided system, or an end user. Further tools have been created over the years,
and the [GNU core utilities](https://en.wikipedia.org/wiki/GNU_Core_Utilities)
are essentially a collection of tools resulting from merging other collections.
Note that there are still many other utilities that are not part of coreutils.
At the same time, there are multiple other implementations now, which differ in
terms of arguments and flags and possibly additional utilities they include.

| tool                                                     | language | license      | usage                   |
| -------------------------------------------------------- | -------- | ------------ | ----------------------- |
| [BusyBox](https://busybox.net/)                          | C        | GPLv2        | Heads                   |
| [toybox](http://landley.net/toybox)                      | C        | 0BSD         | Android                 |
| [GNU coreutils](https://www.gnu.org/software/coreutils/) | C        | GPLv3        | not for LinuxBoot       |
| [u-root](https://u-root.org)                             | Go       | BSD 3-Clause | ByteDance, Google et al |
| [uutils/coreutils](http://uutils.github.io/)             | Rust     | MIT          | not for LinuxBoot       |

### kexec implementations

While [kexec itself is a Linux syscall](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/include/uapi/linux/kexec.h),
it is not a one-shot operation. Loading multiple segments into memory,
synchronizing and unmounting file systems, and the eventual syscall to
[reboot](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/include/uapi/linux/reboot.h)
belong to the procedure. In addition, there are architecture specifics to take
into account. Thus, there are multiple implementations of kexec, which are Linux
programs that offer their own interfaces again to pass extra arguments. Besides
those standalone implementations, there are also specialized boot loaders based
on kexec that have their own extra logic, such as FreeBSD's kload or petitboot.

| tool                                                                                                                                     | language  | license      | usage            |
| ---------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------ | ---------------- |
| [kexec-tools](https://git.kernel.org/pub/scm/utils/kernel/kexec/kexec-tools.git) ([GitHub mirror](https://github.com/horms/kexec-tools)) | C         | GPLv2        | Heads, Petitboot |
| [systemd](https://systemd.io/) (wrapper)                                                                                                 | C         | LGPL-2.1+    | systemd on UEFI  |
| [kexecboot](https://github.com/kexecboot/kexecboot)                                                                                      | C         | GPLv2        | ?                |
| u-root (CLI+mod)                                                                                                                         | Go        | BSD 3-Clause | Google et al     |
| [kexlinux](https://github.com/im-0/kexlinux)                                                                                             | Rust      | LGPL-3.0+    | ?                |

## Boot configuration and menus

There are multiple approaches to configuration and defining menus. Some boot
loaders are using combined configuration files that have both, the options for
the boot loader's appearance and behavior as well as the entries shown in the
boot menu. For each of them, the boot loader itself will need a parser. At the
same time, they are commonly managed from outside the boot loader itself. Note
that those are design decisions and you may choose a different approach.
The following subsections focus on the entries for booting operating systems.

### SYSLINUX

[Configuring SYSLINUX](https://wiki.syslinux.org/wiki/index.php?title=SYSLINUX#How_do_I_Configure_SYSLINUX.3F)
is rather simple. A minimal entry only has a label and a path to a kernel image.

### GRUB

GRUB is very flexible and widely used in operating systems distributions, coming
with its own tools to manage the [configuration file](https://www.gnu.org/software/grub/manual/grub/html_node/Simple-configuration.html).

### BLS

The [Boot Loader Specification (BLS)](https://uapi-group.org/specifications/specs/boot_loader_specification/)
is a fresh approach to boot configuration. Type 1 BLS entries are defined via
separate files in a drop-in directory. There are multiple libraries to handle
them.

| library                                                                               | language | license      | usage      |
| ------------------------------------------------------------------------------------- | -------- | ------------ | ---------- |
| u-root [`pkg/boot/bls`](https://github.com/u-root/u-root/tree/main/pkg/boot/bls)      | Go       | BSD 3-Clause |            |
| [`bootctl`](https://www.freedesktop.org/software/systemd/man/latest/bootctl.html)     | C        | LGPL-2.1+    | systemd    |
| [`boot_loader_spec` crate](https://docs.rs/boot-loader-spec/latest/boot_loader_spec/) | Rust     | MPL-2.0      | ?          |
| [blsforme](https://github.com/AerynOS/blsforme)                                       | Rust     | MPL-2.0      | standalone |
