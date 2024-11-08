# History

## BIOS

BIOS is the good old, inscrutable, unstructured, non-standard way of
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

## LinuxBIOS

`LinuxBIOS` is a project originated in 1999 from Ron Minnich, Stefan Reinauer
and others. It is not much younger than UEFI, but they were already
experimenting the idea of running Linux as firmware! Like many great ideas, it
was way ahead of its time. At that time Linux was not mature enough for
hardware initialization project, and while LinuxBIOS was successful in several
performance-and-reliability critical environments, it didn't see mass adoption.

LinuxBIOS became [coreboot](https://www.coreboot.org/) in 2008.

## LinuxBoot

### NERF

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

### Heads

[Heads](https://trmm.net/Heads) is an open source firmware for laptops and
servers, aimed at strong platform security. Developed by [Trammell
Hudson](https://twitter.com/qrs), this is based on stripped UEFI plus Linux,
and BusyBox instead of u-root.

## Open Platform Firmware

[Open Platform
Firmware](https://www.opencompute.org/projects/open-system-firmware) (OPF),
formerly Open System Firmware (OSF), is an official subproject of the [Open
Compute Project](https://www.opencompute.org) (OCP). OPF has been developed in
the open, by various members of OCP that were interested in having open source
system firmware. OPF defines a set of guidelines with contributions from
Microsoft, Google, Facebook, Intel, 9elements, Two Sigma, and several other
companies.

The important thing to keep in mind is that **Open Platform Firmware is a project
name**, not an implementation, nor an idea. An implementation (like LinuxBoot
or OpenEDK2) can be OPF-compliant if it follows the aforementioned guidelines.

Currently, Open Platform Firmware has two work streams:

* LinuxBoot, led by Google, Facebook, 9elements, ITRenew, TwoSigma, and others
* OpenEDK II, led by Microsoft and Intel
