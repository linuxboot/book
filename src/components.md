# LinuxBoot Components

LinuxBoot consists of the following components:

1. Platform initialization
2. Linux kernel
3. [initramfs](initramfs.md)

## Platform initialization

Sometimes also referred to BIOS, platform initialization is the part of any
firmware that brings up DRAM and enables the platform to run a Linux kernel.
This does not have to be a specific implementation. LinuxBoot has been deployed
based on UEFI PI and [coreboot](https://coreboot.org/), for example.

## Linux kernel

LinuxBoot is not intended to be a runtime production kernel; rather, it is meant
to replace specific firmware functionality using Linux kernel capabilities and
then boot the actual production kernel on the machine. Kernel configuration
files for LinuxBoot should provide only the necessary capabilities without
bloating the size of the firmware image with unnecessary drivers and modules.

These config files disable options that are not needed in the LinuxBoot kernel
and add some patches that are needed, as opposed to generic defaults. In other
words, the kernel is supposed to be platform specific.
