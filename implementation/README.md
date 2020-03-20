The aim of LinuxBoot is to reduce complexity and obscure firmware by moving that functionality into kernel and userspace. This chapter describes the procedures from a [LinuxBoot workshop](https://docs.google.com/presentation/d/1s9ka4v7leKeJa3116AQoNb9cv3OqmnW6pgn0ov9WiHo/edit?ts=5e2b227b#slide=id.g7ceec54197_4_163) where an Atomic Pi board with UEFI firmware was converted to run LinuxBoot. 

## A quick refresher on UEFI

UEFI has three sections:

+   SEC ("Boot") 
+   PEI ("Very early chip setup and DRAM programming")
+   DXE ("DRAM code")

DXE process is very complex; some systems have 750 DXEs.

LinuxBoot replaces most of the UEFI software with Linux. LinuxBoot has an initramfs provided by [u-root](../u-root/README.md).

## How do you get LinuxBoot on your hardware?

Start with a board running standard UEFI and proceed from "zero changes to FLASH" to "max changes" in 4 steps:

1.  Boot from USB stick via UEFI shell command _or_ netboot (zero changes)
1.  Replace UEFI Shell code section with Linux kernel (change part of one thing)
1.  Remove as many DXEs as possible (change by removal). This change:

       *  Speeds boot
       *  Reduces panic possibilities
       *  Removes exploits
       *  In production, it has solved problems

1.  Replace some DXEs with open source components (change by replacement)

## Tools of the trade

There are two tools you use when you modify the UEFI flash image: `utk `and `me_cleaner`

The `utk` tool can:

+   Remove DXEs
+   Insert new DXEs
+   Replace the binary code of a DXE with a kernel

The Management Engine (ME) is an x86 CPU embedded in the Intel Platform Controller Hub (PCH). It runs the Minix operating system which boots first and enables hardware such as clocks and GPIOs. ME checks the contents of flash memory and is used to implement "BootGuard". If you reflash and the ME is in "BootGuard" mode, your machine will be unusable. You need to run a tool called `me_cleaner` on the image to disable BootGuard.

 `/usr/bin/python2 me_cleaner.py -s` _imagefile.bin_

`me_cleaner` sets the high assurance platform (HAP) bit. HAP provides a way to disable a feature on Intel chips that does not allow us to modify the UEFI image and install LinuxBoot. Setting the bit with `me_cleaner` disables the "feature".  Note that this does not always work; check with the LinuxBoot community.  

`
When you run `me_cleaner`

`~/projects/linuxboot/me_cleaner/me_cleaner.py -s /tmp/rom.bin`

you should see output similar to the following:


|  |
|:---|
|`Full image detected`|
|`Found FPT header at 0x1010`|
|`Found 20 partition(s)`|
|`Found FTPR header: FTPR partition spans from 0x6f000 to 0xe700`|
|`ME/TXE firmware version 2.0.5.3112 (generation 2)`|
|`Public key match: Intel TXE, firmware versions 2.x.x.x`|
|`The AltMeDisable bit is SET`|
|`Setting the AltMeDisable bit in PCHSTRP10 to disable Intel ME…`|
|`Checking the FTPR RSA signature... VALID`|
|`Done! Good luck!`|

## LinuxBoot Implementation steps

### Step 1: boot Linux via netboot / UEFI shell

+   netboot: standard BIOS-based PXE boot

    +   Netboot is probably the most common working boot method on UEFI
    +   We have never seen a system that did not have a net boot

+   UEFI Shell (mentioned only for completeness)

    +   Install Linux on FAT-32 media with a name of your choice (e.g. "kernel")
        +   FAT-32, also known as MS-DOS file system
    +   Boot kernel at UEFI Shell prompt
    +   We've run into a few systems that don't have a UEFI shell

#### Working with a system that only has a net interface

If the system only has a net interface, you use Dynamic Host Configuration Protocol (DHCP),
using broadcast DISCOVER, and Trivial File Transfer Protocol (TFTP) to get the boot information you need. 

Configuration information is provided by REPLY to a DHCP request. The REPLY returns an IP, server, and a configuration file name that provides:

   +   Identity
   +   What to boot
   +   Where to get it

Data is provided by TFTP. HTTP downloading takes a fraction of a second even for 16M kernels. With TFTP it's very slow and TFTP won't work with initramfs much large than 32MiB. Most LinuxBoot shops use or are transitioning to HTTP.

Note: Boot images require a kernel(bzImage) + an initramfs + a command line. They can be loaded as three pieces or compiled and loaded as one piece, as described in this section.

### Step 2: replace Shell binary section

+   UEFI Shell is a DXE

    +   DXEs are Portable Executable 32-bit binaries (PE32)
    +   They have multiple sections, one of them being binary code
    +   You need a flash image (in this case called _firmware.bin_). You can get it via vendor website, flashrom, or other mechanism.

+   The following `utk` command replaces the Shell code section with a Linux kernel:

  `utk firmware.bin replace_pe32 Shell bzImage save` _new.bin_

   Note: It's always a PE32, even for 64-bit kernels. _new.bin_ is a filename of your  choosing.

+   After running `utk`, you can reflash

### Step 3: remove as many DXEs as possible

+   You can do an initial mass removal based on your current knowledge
+   `utk` automates removing DXEs: this is the DXE cleaner

    +   `utk` removes a DXE, reflashes, checks if it boots, repeats

    This part should be easy: DXE can have a dependency section. In practice, it's hard: because dependency sections are full of errors and omissions. A lot of UEFI code does not check for failed DXE loads.

### Step 4: replace closed-source with open source

+   If you can build a DXE from source, you can use `utk` to remove the proprietary one and replace it with one built from source. You can get DXE source from the tianocore/EDK2 source repo at github.com. The GitHub repo has a **_limited_** number of DXEs in source form; i.e., you can't build a full working image using it.
+   There are scripts that let you compile individual DXEs, including the UEFI Shell and Boot Device Selection (BDS). These two DXEs have been compiled and are used in the Atomic Pi. Source-based BDS was needed to ensure the UEFI Shell was called.
+   You only need the UEFI Shell built long enough to replace it with Linux.

### Final step: reflash the image

+   "Native" reflash: Boot the system whatever way is easiest: netboot, usb, local disk, and run:

    `flashrom -p internal -w _filename.bin_`

    where _filename.bin_ is a filename of your choosing.

+   Run `flashrom` with an external device such as an sf100. There may be a header on the board, or you might have to use a clip.

    `flashrom -p dediprog:voltage=1.8 -w _filename.bin_`

The voltage option is required for the Atomic Pi.

