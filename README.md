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
| [02](getting_started/README.md) | **Getting Started in 20 mins** |
| 02a | &emsp; &emsp; Getting started on QEMU |
| 02a | &emsp; &emsp; Getting started on hardware |
| 03  | **LinuxBoot** |
| 04  | **Minimal Linux Kernel** |
| 05  | **The Initramfs** |
| 05a | &emsp; &emsp; HEADS |
| [05b](u-root/README.md) | **U-root: A Go-based, Firmware Embeddable Root File System** |
| 06  | **UEFI** |
| 06a | &emsp; &emsp; EDKII |
| 06b | &emsp; &emsp; OVMF |
| 07  | **Tools** |
| 07a | &emsp; &emsp; UEFITool and UEFIReplace |
| [07b](UEFI_Tool_Kit/README.md) | &emsp; &emsp; UEFI Tool Kit |
| 07c | &emsp; &emsp; LinuxBoot Scripts (Trammell Hudson) |
| 07d | &emsp; &emsp; FMAP tool |
| 08  | **TPMs** |
| 09  | **SecureBoot and BootGuard** |
| [10](coreboot.u-root.systemboot/README.md)  | **coreboot, u-root and systemboot** |
| 11  | **Arm + u-boot** |
| [12](dut/README.md) | **DUT, Device Under Test framework** |
| [13](cpu/README.md) | **CPU, wherever you go, there your files are** |
| [14](case_studies/README.md) | **Case Studies** |

## Acknowledgments

* Andrea Barberio
* Johnny Lin
* Jonathan Zhang
* Philipp Deppenwiese
* Ronald Minnich
* Ryan O'Leary
