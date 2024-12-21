# Glossary

- ___BIOS___: Originally, BIOS was the software built into computers to send
  simple instructions to the hardware, allowing input and output before the
  operating system was loaded. It was a binary blob with no standardized
  structure that was responsible for initializing CPU and memory, and jumping
  to a hard-coded position on the master block of the first disk drive. BIOS
  has been largely replaced by UEFI. Many UEFI implementations still offer a
  "BIOS compatibility mode" which makes it behave like an old BIOS, with its
  features.
- ___busybox___: Busybox is a single userspace binary which includes versions
  of a large number of system commands, including a shell. This package can be
  very useful for recovering from certain types of system failures,
  particularly those involving broken shared libraries. There are multiple
  implementations of busybox, such as git.busybox.net/busybox and
  github.com/u-root/u-root.
- [___coreboot___](https://doc.coreboot.org/): A project to develop open source
  boot firmware for various architectures. Its design philosophy is to do the
  bare minimum necessary to ensure that hardware is usable and then pass
  control to a different program called the payload. The payload can then
  provide user interfaces, file system drivers, various policies etc. to load
  the OS.
- ___DHCP___: A networking protocol that runs on a DHCP server and that
  automatically assigns an IP address from a pre-configured pool to any machine
  that queries it on boot up.
- [___EDK II___](https://github.com/tianocore/edk2): An open source reference
  implementation of an UEFI-compliant firmware, originally developed by Intel
- ___firmware___: A specific class of computer software that provides low-level
  control for a device's specific hardware. It is installed at the time of
  manufacturing and is the first program that runs when a computer is turned
  on. It checks to see what hardware components the computing device has, wakes
  the components up, and hands them over to the operating system that is to be
  installed on the machine. The current x86 firmware is based on Intel’s
  Universal Extensible Firmware Interface (UEFI).
- [___Heads___](https://github.com/linuxboot/heads): An open source firmware
  for laptops and servers, aimed at strong platform security. Developed by
  Trammell Hudson, based on stripped UEFI plus Linux, and BusyBox instead of
  u-root.
- ___iSCSI___: A protocol that provides a way to make network-attached storage
  appear to be a local device to the hosts using it, allowing it to be (among
  other things) mounted as a regular local file system.
- ___kexec___: A system call that enables you to load and boot into another
  kernel from the currently running kernel. kexec performs the function of the
  boot loader from within the kernel.
- ___LinuxBIOS___: A project originated in 1999 from Ron Minnich, Stefan
  Reinauer and others. It was an experiment in the idea of running Linux as
  firmware. At that time Linux was not mature enough for a hardware
  initialization project, and while LinuxBIOS was successful in several
  performance-and-reliability critical environments, it didn't see mass
  adoption. It later became coreboot.
- ___LinuxBoot___: LinuxBoot is not a product, but rather a concept. It's the
  idea of booting Linux (OS) with Linux (system firmware). In a way, the same
  concept pioneered by LinuxBIOS. It is like a Linux distribution, but for
  firmware. It is a collection of various open source components, combined to
  work as a consistent firmware OS.
- ___NERF___: The original name for the LinuxBoot project composed of stripped
  UEFI plus Linux plus u-root. The name stands for Non-Extensible Reduced
  Firmware, as opposed to UEFI's Unified Extensible Firmware Interface. NERF is
  an UEFI replacement that is more compact and less extensible. While
  extensibility is nice and often desirable, too much extensibility can make a
  complex project very hard to maintain and keep secure.
- ___Open Source Firmware___: OSF can be used to refer to Open Source Firmware
  or Open System Firmware depending on the context.
- ___Open System Firmware (OSF)___: An official subproject of the Open Compute
  Project (OCP). OSF has been developed in the open, by various members of OCP
  that were interested in having open source system firmware. OSF defines a set
  of guidelines with contributions from Microsoft, Google, Facebook, Intel,
  9elements, TwoSigma, and several other companies.
- ___OVMF___: Open Virtual Machine Firmware. Open Virtual Machine Firmware is a
  build of EDK II for virtual machines. It includes full support for UEFI,
  including Secure Boot, allowing use of UEFI in place of a traditional BIOS in
  your EFI Initialization (PEI)|UEFI stage which runs before RAM is
  initialized, from cache and ROM. PEI is mostly C-code running in 32-bit
  protected flat mode.  The main goal of the PEI stage is to detect RAM. As
  soon as RAM is detected and configured, PEI stage give control to the DXE
  through DXE Initial Program Load (IPL) driver
- ___production kernel___: LinuxBoot is not intended to be a runtime production
  kernel; rather, it is meant to replace specific UEFI functionality using
  Linux kernel capabilities and then boot the actual production kernel
  (prodkernel) on the machine. Kernel configuration files specific to LinuxBoot
  provide the needed Linux kernel capabilities without bloating the size of the
  BIOS with unnecessary drivers.
- ___PureBoot___: A combination of disabling IME, coreboot, a TPM, Heads and
  the Librem Key (see [Trusted Boot (Anti-Evil-Maid, Heads, and
  PureBoot)](https://tech.michaelaltfield.net/2023/02/16/evil-maid-heads-pureboot/#pureboot))
- ___QEMU___: An emulator that performs hardware virtualization. QEMU is a
  hosted virtual machine monitor.
- ___Secure Boot Preverifier (SEC)___: In UEFI, the SEC stage initializes the
  CPU cache-as-RAM (CAR) and gives control to the PEI dispatcher. It is 99.9%
  assembly code (32-bit protected mode).
- ___u-boot___: A very popular open source firmware and bootloader. Not to be
  confused with u-root.
- ___u-root___: A modern, embedded userspace environment for Linux, with
  bootloader tools. See the section on u-root.
- ___UEFI___: Unified Extensible Firmware Interface. It is Intel’s
  specification of a standard for system firmware. UEFI defines everything from
  the layout on the flash chip, to how to interface to peripherals, enables
  boot from disk or from a network, defines how UEFI applications work, etc).
  It is not an implementation, it's a standard. EDK II and OpenEDK II are UEFI
  implementations. UEFI is not closed source per-se, but in practice most
  implementations are.
- ___userland/userspace___: A set of programs and libraries that are used to
  interact with the kernel.
