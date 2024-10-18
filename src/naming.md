# coreboot, LinuxBoot, NERF... What?

Naming is hard. You may have heard of `coreboot`, `NERF`, `u-root`,
`systemboot`, etc. If you are confused, well, you're not alone.

# LinuxBIOS

`LinuxBIOS` is a project originated in 1999 from Ron Minnich, Stefan Reinauer
and others. It is not much younger than UEFI, but they were already
experimenting the idea of running Linux as firmware! Like many great ideas, it
was way ahead of its time. At that time Linux was not mature enough for
hardware initialization project, and while LinuxBIOS was successful in several
performance-and-reliability critical environments, it didn't see mass adoption.

# coreboot

LinuxBIOS became `coreboot` in 2008. It is effectively the same project that
evolved over time. `coreboot` (spelled lowercase) is a complete open source
system firmware package, aimed at replacing proprietary implementations. It's
also one of the most mature and well-maintained open source firmware projects.

`coreboot` supports a **wide varieties of platforms**, and has a **modular
architecture**. It provides **platform initialization** (CPU, DRAM, PCI, ACPI,
SMBIOS, etc), **a filesystem** (CBFS) suitable for on-firmware storage,
integration with **vendor extensions and blobs**, a friendly license, and a
**wide variety of payloads**.

This modular design also **enables various bootloader scenarios**, through
coreboot payloads. Among the various options, there are:

* *SeaBIOS*, a very popular open source BIOS implementation
* *depthcharge*, the blazing-fast boot payload for ChromeOS/Chromebooks
* *LinuxBoot*, of course! More details below
* *UEFI*, via the open-source EDK II.

# LinuxBoot

LinuxBoot is not a product, but rather a **concept**. It's the idea of
**booting Linux (OS) with Linux (system firmware)**. In a way, the same concept
pioneered by LinuxBIOS.

"LinuxBoot" is also often used as an umbrella name at Facebook to indicate how
we do open source firmware, i.e. coreboot + Linux + u-root + systemboot.
**Imagine it like a Linux distribution, but for firmware**. It is a collection
of various open source components, glued together to work as a consistent
firmware OS.

Depending on who you are talking to, you may hear "LinuxBoot" used as a
reference to "stripped UEFI, plus Linux". This is because LinuxBoot, when
originally created, was meant to run a Linux kernel on top of a stripped UEFI
firmware, not on coreboot. See also "NERF" below.

# NERF

This is the original name for the stripped UEFI, plus Linux, plus u-root. The
name stands for Non-Extensible Reduced Firmware, as opposed to UEFI's Unified
Extensible Firmware Interface. Basically, saying that NERF is an UEFI
replacement that prefers to be more compact, less extensible, and a bit more
opinionated. While extensibility is nice and often desirable, too much
extensibility and too many "yes" can make a complex project very hard to
maintain and keep secure.

NERF started from Ron Minnich (one of the coreboot founders) at Google, and is
now developed by a few other folks that are now part of Google's "NERF team".
This name, in my understanding, is mostly used within Google, while "LinuxBoot"
is becoming a more common name for this effort.

# Heads

Heads is an open source firmware for laptops and servers, aimed at strong
platform security. Developed by [Trammell Hudson](https://twitter.com/qrs),
this is based on stripped UEFI plus Linux, and BusyBox instead of u-root. More
info at https://trmm.net/Heads .

# Open System Firmware

[Open System Firmware](https://www.opencompute.org/projects/open-system-firmware),
or in short OSF, is an official subproject of the [Open Compute
Project](https://www.opencompute.org) (OCP). OSF has been developed in the
open, by various members of OCP that were interested in having open source
**system firmware**. OSF defines a set of guidelines with contributions from
Microsoft, Google, Facebook, Intel, 9elements, TwoSigma, and several other
companies.

The important thing to keep in mind is that **Open System Firmware is a project
name**, not an implementation, nor an idea. An implementation (like LinuxBoot
or OpenEDK2) can be OSF-compliant if it follows the aforementioned guidelines.

Currently, Open System Firmware has two work streams:

* LinuxBoot, led by Google, Facebook, 9elements, ITRenew, TwoSigma, and others
* OpenEDK II, led by Microsoft and Intel.

# Open Source Firmware

While this may sound obvious, it's worth noting that OSF can be used to refer
to "Open Source Firmware" or "Open System Firmware" depending on the context.
Confusing? I couldn't agree more.

# BIOS

BIOS is the good old, imperscrutable, unstructured, non-standard way of
initializing a hardware platform in the pre-UEFI days. In other words it's a
binary blob with no standardized structure, that is responsible for
initializing CPU and memory, and jumping to a hard-coded position on the MBR of
the first disk drive.

BIOS has been largely replaced by the (much better) UEFI over the past 20
years. Many UEFI implementations still offer a "BIOS compatibility mode" which
make it behave like an old BIOS, with its (lack of) features.

BIOS is also a misused term for system firmware nowadays. You may still hear
"BIOS" in reference to system firmware, either it's UEFI or even LinuxBoot.
However, "BIOS" refers to a specific type of firmware, and UEFI is definitely
not BIOS, just like LinuxBoot is not BIOS.

# UEFI

It's a complex specification of a standard for system firmware. It defines
everything from the layout on the flash chip, to how to interface to
peripherals, boot from disk or from network, how UEFI applications work, etc).
**It is not an implementation**, it's a standard. EDK II and OpenEDK II are
UEFI implementations.

UEFI is not closed source per-se, but in practice most implementations are.
Typically IBVs and ODMs would take a snapshot of the reference implementation
EDK II, and base their work on that, with their patches and additional
components.

# EDK II

It is the open source reference implementation of an UEFI-compliant firmware,
originally developed by Intel. See https://github.com/tianocore/edk2 .

# u-boot

u-boot is another very popular open source firmware and bootloader.

# u-root

u-root is not u-boot! They are two completely different projects.

u-root is modern, embedded userspace environment for Linux, with bootloader
tools. u-root has several advantages:

* it is written in a memory-safe language, Go, and it's compiled to avoid
  native code (CGo is disabled). No segfaults at firmware space!
* it has a bb (busybox) mode: it's more space-efficient than compiling the
  programs individually, because it automatically merges the source code of the
  programs and libraries you need, into one.
* it has a source mode: you have the source code of your tools **in the
  firmware image**, so you can modify any tool in place and re-run it, instead
  of rebuilding the whole image and reflashing, rebooting, and re-running the
  tool
* it **can run any unmodified Go program**, it doesn't have to be written
  specifically for u-root (while with BusyBox it needs to be part of that
  source tree, using different libraries). This allows using any Go library or
  program written for non-embedded environments
* is **blazing fast to build**: seconds instead of minutes
