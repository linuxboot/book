# Implementing LinuxBoot

The aim of LinuxBoot is to reduce complexity and obscure firmware by moving
that functionality into kernel and user-space. So you will need the necessary
[components](components.md) and fit them into the boot flow.

Since there are multiple approaches to initialize the platform, such as [UEFI
PI](uefi-pi-retrofit.md), U-Boot XPL, barebox PBL, coreboot and oreboot, and
hardware vendors differ in openness, different strategies are required,
explained in this chapter.
