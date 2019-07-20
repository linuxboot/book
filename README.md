# The LinuxBoot Book

LinuxBoot is a project that aims to replace specific firmware functionality with
a Linux kernel and runtime. Over the years this project has grown to include 
various initiatives with the overarching goal of moving from obscure, complex 
firmware to simpler, open source firmware. 

This is the official site of documentation for the LinuxBoot project. The book 
provides guidance on how to get started, and gives overviews and 
background on the different aspects of LinuxBoot.

## Table of Contents

| #   | Chapter |
| --- | ------- |
| 01  | **Introduction** |
| [02](naming/README.md) | **Naming: coreboot, LinuxBoot, NERF... What?** |
| [03](getting_started/README.md) | **Getting Started in 20 mins** |
| 03a | &emsp; &emsp; Getting started on QEMU |
| 03a | &emsp; &emsp; Getting started on hardware |
| 04  | **LinuxBoot** |
| 05  | **Minimal Linux Kernel** |
| 06  | **The Initramfs** |
| 06a | &emsp; &emsp; HEADS |
| [06b](u-root/README.md) | **U-root: A Go-based, Firmware Embeddable Root File System** |
| 07  | **UEFI** |
| 07a | &emsp; &emsp; EDKII |
| 07b | &emsp; &emsp; OVMF |
| 08  | **Tools** |
| 08a | &emsp; &emsp; UEFITool and UEFIReplace |
| [08b](UEFI_Tool_Kit/README.md) | &emsp; &emsp; UEFI Tool Kit |
| 08c | &emsp; &emsp; LinuxBoot Scripts (Trammell Hudson) |
| 08d | &emsp; &emsp; FMAP tool |
| 09  | **TPMs** |
| 010  | **SecureBoot and BootGuard** |
| [11](coreboot.u-root.systemboot/README.md)  | **coreboot, u-root and systemboot** |
| 12  | **Arm + u-boot** |
| [13](dut/README.md) | **DUT, Device Under Test framework** |
| [14](cpu/README.md) | **CPU, wherever you go, there your files are** |
| [15](case_studies/README.md) | **Case Studies** |

## Acknowledgments

* Andrea Barberio
* Johnny Lin
* Jonathan Zhang
* Philipp Deppenwiese
* Ronald Minnich
* Ryan O'Leary
