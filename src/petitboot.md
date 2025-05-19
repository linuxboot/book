# Petitboot

petitboot is a Linux user-space application written in C that calls `kexec`.
The `kexec` installed in the initramfs is not the mainline kexec-tools
implementation, but a smaller implementation named
[kexec-lite](https://github.com/antonblanchard/kexec-lite). It is claimed to be
roughly 32 KB compared to kexec-tools, which is roughly 200 KB.[^1]

[^1]: <https://github.com/antonblanchard/kexec-lite/issues/4#issuecomment-314936778>
