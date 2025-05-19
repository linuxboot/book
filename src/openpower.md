# OpenPOWER boot chain

```mermaid
flowchart LR
    skiroot(["skiroot (petitboot)"])
    SBEs-->hostboot-->skiboot-->skiroot-->OS
```

- [Self-boot engines](https://github.com/open-power/sbe) (SBE) are split
  between an on-chip ROM and an external EEPROM
- [hostboot](https://github.com/open-power/hostboot) is a C++ boot loader that
  does DRAM initialization provides runtime services to skiboot or a hypervisor
- [skiboot](https://github.com/open-power/skiboot) is a C boot loader and
  runtime firmware for OpenPOWER that loads skiroot.

skiroot is a term used to describe the LinuxBoot implementation for OpenPOWER.
A skiroot repository or package does not exist. The term is only used in the
kernel configuration, `skiroot_defconfig`.[^1]

## See also

- [coreboot and Heads as an alternative firmware for OpenPOWER Talos
  II](https://openpower.foundation/blog/coreboot-on-talos2/)

[^1]: <https://github.com/open-power/op-build/blob/master/openpower/configs/linux/skiroot_defconfig>
