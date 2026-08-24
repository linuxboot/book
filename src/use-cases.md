# Use cases

The general concept of using a Linux kernel to boot into an operating system
sounds simple at first glance. The challenges in the details, in part not only
limited to using Linux, are being discussed in this chapter, with ideas on
solving specific problems in the domain of bootloaders.

## Constrained environments

Booting a system means dealing with constraints. Those can have either of two
effects: spark creativity or keep you from pursuing a goal. On foot, you can
only reach as far in a day, whereas a vehicle gets you much further. With
LinuxBoot, we want to take the chance to reevaluate contemporary designs and go
beyond.

When it comes to hardware, the vendor would choose the parts for their product
and consider them in their price calculation.

One main constraint is the initial boot source. A System-on-Chip (SoC) typically
starts off with a mask ROM and continues with a simple storage part, which may
range from a SPI flash of a few megabytes up to eMMC or SD cards of hundreds of
megabytes or even gigabytes.

We neglect other storages here that are attached via NVMe, SATA or other
high-speed buses, because those are commonly not supported by mask ROMs. They
are, on the other hand, what a bootloader offers to boot from, as well as
network sources.

## Embedded devices

Many devices, nowadays known as IoT (Internet of Things), appliances, or
similar, have a narrow use case. They are meant to perform a specific set of
tasks, and thus can be tailored for it. In hardware terms, that often means an
SoC, a bit of storage, and peripherals. Debug interfaces are reduced or removed
for the final product.

## Desktop, laptop, workstation and server systems

At this point, many systems are still based on x86 processors, coming with a SPI
flash on the board. While laptops and desktops mostly have a mere 16 or 32
megabytes to offer, high-end servers and workstations already have 64, and even
a second whole system called the Board Management Controller (BMC), which has
its own firmware and corresponding storage. Designs around those constraints
vary among OEMs.

Note that it need not be that way. Arm based, RISC-V based and other systems
already show that you can expect more, such as booting off eMMC. Laptops and
desktop boards in that range are available as of now, even some servers and
workstations.

## Single Board Computers (SBCs)

The SBC market has grown to such a degree that credit card size boards nowadays
comes with both small storage parts that can act as boot sources as well as PCIe
connectors that can hold NVMes of gigabytes and terabytes of storage. This gives
us the opportunity to work out a boot flow that provides the end user with a
very rich environment already early on before the main operating system is
loaded.

## General vs single purpose

While all the different kinds of devices have their constraints, any of them may
serve a specific purpose, or be more open to end user modification. For example,
a laptop may be locked down to only allow a vendor's operating system to run,
and no custom firmware. Or it may allow for installing any system an end user
may want. There are, however, many use cases in between.

Given the ability to customize the firmware, a server system for general use
differs significantly from special environments like a hyperscaler data-center,
where the hardware owner has their own infrastructure to boot from.
In that case, one would implement LinuxBoot oneself to meet those requirements.
For a general purpose system, on the other hand, a prebuilt LinuxBoot
distribution needs to be able to boot many different operating systems, such as
Ubuntu, Fedora, and openSUSE.
