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

| tool                                                     | language | license      | usage                   |
| -------------------------------------------------------- | -------- | ------------ | ----------------------- |
| [BusyBox](https://busybox.net/)                          | C        | GPLv2        | Heads                   |
| [toybox](http://landley.net/toybox)                      | C        | 0BSD         | Android                 |
| [GNU coreutils](https://www.gnu.org/software/coreutils/) | C        | GPLv3        | not for LinuxBoot       |
| [u-root](https://u-root.org)                             | Go       | BSD 3-Clause | ByteDance, Google et al |
| [uutils/coreutils](http://uutils.github.io/)             | Rust     | MIT          | not for LinuxBoot       |

## kexec implementations

| tool                                                                                                                                     | language  | license      | usage            |
| ---------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------ | ---------------- |
| [kexec-tools](https://git.kernel.org/pub/scm/utils/kernel/kexec/kexec-tools.git) ([GitHub mirror](https://github.com/horms/kexec-tools)) | C         | GPLv2        | Heads, Petitboot |
| [systemd](https://systemd.io/) (wrapper)                                                                                                 | C         | LGPL-2.1+    | systemd on UEFI  |
| [kexecboot](https://github.com/kexecboot/kexecboot)                                                                                      | C         | GPLv2        | ?                |
| u-root (CLI+mod)                                                                                                                         | Go        | BSD 3-Clause | Google et al     |
| [kexlinux](https://github.com/im-0/kexlinux)                                                                                             | Rust      | LGPL-3.0+    | ?                |
