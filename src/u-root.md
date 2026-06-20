# All about u-root

The [u-root project](https://u-root.org) consists of a build tool and sources to
generate a root file system with boot loaders suitable to implement LinuxBoot.
All the u-root utilities, roughly corresponding to standard Unix utilities, are
written in [Go, a modern, type-safe language](./u-root-golang.md) with garbage
collection and out-of-the-box support for concurrency.

u-root blurs the line between script-based distros such as Perl Linux[^24] and
binary-based distros such as BusyBox[^26]. It has the flexibility of Perl Linux
and the performance of BusyBox. Scripts and builtins are written in Go, not a
shell scripting language. u-root is a new way to package and distribute file
systems for embedded systems, and the use of Go promises a dramatic improvement
in their security.

## Embedded systems

Embedding kernels and root file systems in BIOS flash is a common technique for
gaining boot time performance and platform customization[^25] [^14] [^23].
Almost all new firmware includes a multiprocess operating system with a full
complement of file systems, network drivers, and protocol stacks, all contained
in an embedded file system. In some cases, the kernel is only booted long
enough to boot another kernel. In others, the kernel that is booted and the
file system it contains constitute the operational environment of the
device[^15]. These so-called “embedded root file systems” also contain a set of
standard Unix-style programs used for both normal operation and maintenance.
Space on the device is at a premium, so these programs are usually written in C
using the BusyBox toolkit[^26], or in an interpretive language such as Perl[^24]
or Forth. BusyBox in particular has found wide usage in embedded appliance
environments, as the entire root file system can be contained in under one MiB.

Embedded systems, which were once standalone, are now almost always network
connected. Network connected systems face a far more challenging security
environment than even a few years ago. In response to the many successful
attacks against shell interpreters[^11] and C programs[^8], we have started to
look at using a more secure, modern language in embedded root file systems,
namely, Go[^21] [^16].

## Safety and security

The modern language constructs make Go a much safer language than C. This safety
is critical for network-attached embedded systems, which usually have network
utilities written in C, including web servers, network servers including `sshd`,
and programs that provide access to a command interpreter, itself written in C.
All are proving to be vulnerable to the attack-rich environment[^19] that the
Internet has become. Buffer overflow attacks affecting C-based firmware code
(among other things) in 2015 include GHOST and the so-called FSVariable.c bug in
Intel’s UEFI firmware. Buffer overflows in Intel’s UEFI and Active Management
Technology (AMT) have also been discovered in several versions in recent years.

Both UEFI[^12] and AMT[^4] are embedded operating systems, loaded from flash and
possibly running network-facing software. Attacks against UEFI have extensively
been studied[^9]. Most printers are network-attached and are a very popular
exploitation target[^6]. Firmware is not visible to most users and is updated
much less frequently (if at all) than OS software. It is the first software to
run, at power on reset. Exploits in firmware are extremely difficult to detect,
because firmware is designed to be as invisible as possible. Firmware is
extremely complex; UEFI is roughly equivalent in size and capability to a Unix
kernel. Firmware is usually closed and proprietary, with nowhere near the level
of testing of kernels. These properties make firmware an ideal place for
so-called advanced persistent threats[^10] [^18] [^5] (APTs). Once an exploit is
installed, it is almost impossible to remove, since the exploit can inhibit its
removal by corrupting the firmware update process. The only sure way to mitigate
a firmware exploit is to destroy the hardware.

## u-root design

Designed to be a suitable option for embedded systems, the u-root build system
allows to choose the commands and files to include via templates and build
command arguments, so it can be tailored for a specific use case.

Since the init program itself is only few lines of code and is easy to change,
the structure is very flexible and allows for many use cases, for example:

* Additional binaries: if the 3 seconds it takes to get to a shell is too
  long (some applications such as automotive computing require 800 ms startup
  time), and there is room in flash, more programs can be added into `/bin`.
* Selectively remove binaries after use: if RAM space is at a premium, once
  booted, a script can remove files from `/bin`.
* Lockdown: if desired, the system can be locked down once booted in one of
  several ways. For example, the flash part can be made read-only by a script.

Scripts can be written in Go, not a shell scripting language, with two benefits:

* the shell can be simple, with fewer corner cases
* the scripting environment is substantially improved since Go is more powerful
  than most shell scripting languages, less fragile and less prone to bugs

## u-root functionality

A u-root initial RAM file system (initramfs) is commonly stored in the cpio
format. It is usually compressed and contained in a Linux kernel image, known as
`bzImage` on x86. A bootloader (for example, syslinux) or firmware (for example,
coreboot) loads the kernel into memory and starts it. The Linux kernel sets up
a RAM-based root file system and unpacks the u-root file system into it.

All Unix systems start an init process on boot and u-root is no exception. The
init for u-root sets up some basic directories, symlinks, and files.

For most programs to work, the file system must be more complete. Image space
is saved by having init create additional file system structure at boot time:
it fills in the missing parts of the root filesystem. It creates `/dev` and
`/proc` and mounts them.

## Using external packages and programs

No root file system can provide all the packages all users want, and u-root is
no exception. You need to have the ability to load external packages from
popular Linux distros. The `tcz` command can be used to load external packages
from the TinyCore Linux distribution, also known as *tinycore*. A tinycore
package is a mountable file system image, containing all the package files,
including a file listing any additional package dependencies. To load these
packages, u-root provides the `tcz` command which fetches the package and
needed dependencies. Hence, if a user wants emacs, they need merely type `tcz
emacs`, and emacs will become available in `/usr/local/bin`. The tinycore
packages directory can be a persistent directory or it can be empty on each
boot.

The `tcz` command is quite flexible as to what packages it loads and where they
are loaded from. Users can specify the host name which provides the packages,
the TCP port on which to connect, the version of tinycore to use, and the
architecture. The `tcz` command must loopback mount each package as it is
fetched, and hence must cache them locally. It will not refetch already cached
packages. This cache can be volatile or maintained on more permanent storage.
Performance varies depending on the network being used and the number of
packages being loaded, but averages about 1 second per package on a
WiFi-attached laptop. u-root also provides a small web server, called
*srvfiles*, that can be used to serve locally cached tinycore packages for
testing.

## History and related work

### On-demand compilation

Earlier iterations of u-root offered on-demand compilation, one of the oldest
ideas in computer science.
Slimline Open Firmware (SLOF)[^7] is a FORTHbased implementation of Open
Firmware developed by IBM for some of its Power and Cell processors. SLOF is
capable of storing all of Open Firmware as source in the flash memory and
compiling components to indirect threading on demand[^2].

In the last few decades, as our compiler infrastructure has gotten slower and
more complex, true on-demand compilation has split into two different forms.
First is the on-demand compilation of source into executable byte codes, as in
Python. The byte codes are not native but are more efficient than source. If
the python interpreter finds the byte code it will interpret that instead of
source to provide improved performance. Java takes the process one step further
with the Just In Time compilation of byte code to machine code[^20] to boost
performance.

### Embedding kernel and root file systems in flash

The LinuxBIOS project[^14] [^1], together with clustermatic[^25], used an embedded
kernel and simple root file system to manage supercomputing clusters. Due to
space constraints of 1 MiB or less of flash, clusters embedded only a
single-processor Linux kernel with a daemon. The daemon was a network
bootloader that downloaded a more complex SMP kernel and root file system and
started them. Clusters built this way were able to boot 1024 nodes in the time
it took the standard PXE network boot firmware to find a working network
interface.

Early versions of One Laptop Per Child used LinuxBIOS, with Linux in flash as a
boot loader, to boot the eventual target. This system was very handy, as they
were able to embed a full WIFI stack in flash with Linux, and could boot test
OLPC images over WIFI. The continuing growth of the Linux kernel, coupled with
the small flash size on OLPC, eventually led OLPC to move to Open Firmware.

AlphaPower shipped their Alpha nodes with a so-called Direct Boot Linux, or
DBLX. This work was never published, but the code was partially released on
sourceforge.net just as AlphaPower went out of business.  Compaq also worked
with a Linux-As-Bootloader for the iPaq.

Car computers and other embedded ARM systems frequently contain a kernel and an
ext2 formatted file system in NOR flash, that is, flash that can be treated as
memory instead of a block device. Many of these kernels use the so-called
eXecute In Place[^3] (XIP) patch, which allows the kernel to page binaries
directly from the memory-addressable flash rather than copying it to RAM,
providing a significant savings in system startup time. A downside of this
approach is that the executables can not be compressed, which puts further
pressure on the need to optimize binary size. NOR flash is very slow, and
paging from it comes at a significant performance cost. Finally, an
uncompressed binary image stored in NOR flash has a much higher monetary cost
than the same image stored in RAM since the cost per bit is so much higher.

UEFI[^12] contains a non-Linux kernel (the UEFI firmware binary) and a full set
of drivers, file systems, network protocol stacks, and command binaries in the
firmware image. It is a full operating system environment realized as firmware.

The ONIE project[^23] is a more recent realization of the Kernel-in-flash idea,
based on Linux. ONIE packs a Linux kernel and Busybox binaries into a very
small package. Since the Linux build process allows an initial RAM file system
(initramfs) to be built directly into the kernel binary, some companies are now
embedding ONIE images into flash with coreboot. Sage Engineering has shown a
bzImage with a small Busybox packed into a 4M image. ONIE has brought new life
to an old idea: packaging a kernel and small set of binaries in flash to create
a fast, capable boot system.

## References

[^1]: AGNEW, A., SULMICKI, A., MINNICH, R., AND ARBAUGH, W. A. Flexibility in
    rom: A stackable open source bios. In USENIX Annual Technical Conference,
    FREENIX Track (2003), pp. 115–124.
[^2]: (AUTHOR OF SLOF), S. B. Personal conversation.
[^3]: BENAVIDES, T., TREON, J., HULBERT, J., AND CHANG, W. The enabling of an
    execute-in-place architecture to reduce the embedded system memory
    footprint and boot time. Journal of computers 3, 1 (2008), 79–89.
[^4]: BOGOWITZ, B., AND SWINFORD, T. Intel⃝R active management technology
    reduces it costs with improved pc manageability. Technology@ Intel Magazine
    (2004).
[^5]: CELEDA, P., KREJCI, R., VYKOPAL, J., AND DRASAR, M. Embedded malware-an
    analysis of the chuck norris botnet. In Computer Network Defense (EC2ND),
    2010 European Conference on (2010), IEEE, pp. 3–10.
[^6]: CUI, A., COSTELLO, M., AND STOLFO, S. J. When firmware modifications
    attack: A case study of embedded exploitation. In NDSS (2013).
[^7]: DALY, D., CHOI, J. H., MOREIRA, J. E., AND WATERLAND, A. Base operating
    system provisioning and bringup for a commercial supercomputer. In Parallel
    and Distributed Processing Symposium, 2007. IPDPS 2007. IEEE International
    (2007), IEEE, pp. 1–7.
[^8]: DURUMERIC, Z., KASTEN, J., ADRIAN, D., HALDERMAN, J. A., BAILEY, M., LI,
    F., WEAVER, N., AMANN, J., BEEKMAN, J., PAYER, M., ET AL. The matter of
    heartbleed. In Proceedings of the 2014 Conference on Internet Measurement
    Conference (2014), ACM, pp. 475–488.
[^9]: KALLENBERG, C., AND BULYGIN, Y. All your boot are belong to us intel,
    mitre. cansecwest 2014.
[^10]: KALLENBERG, C., KOVAH, X., BUTTERWORTH, J., AND CORNWELL, S. Extreme
    privilege escalation on windows 8/uefi systems.
[^11]: KOZIOL, J., LITCHFIELD, D., AITEL, D., ANLEY, C., EREN, S., MEHTA, N.,
    AND HASSELL, R. The Shellcoder’s Handbook. Wiley Indianapolis, 2004.
[^12]: LEWIS, T. Uefi overview, 2007.
[^14]: MINNICH, R. G. Linuxbios at four. Linux J. 2004, 118 (Feb. 2004), 8–.
[^15]: MOON, S.-P., KIM, J.-W., BAE, K.-H., LEE, J.-C., AND SEO, D.-W. Embedded
    linux implementation on a commercial digital tv system. Consumer
Electronics, IEEE Transactions on 49, 4 (Nov 2003), 1402–1407.
[^16]: PIKE, R. Another go at language design. Stanford University Computer
    Systems Laboratory Colloquium.
[^18]: SACCO, A. L., AND ORTEGA, A. A. Persistent bios infection. In CanSecWest
    Applied Security Conference (2009).
[^19]: SAMPATHKUMAR, R. Vulnerability Management for Cloud Computing-2014: A
    Cloud Computing Security Essential. Rajakumar Sampathkumar, 2014.
[^20]: SUGANUMA, T., OGASAWARA, T., TAKEUCHI, M., YASUE, T., KAWAHITO, M.,
    ISHIZAKI, K., KOMATSU, H., AND NAKATANI, T. Overview of the ibm java
    just-in-time compiler. IBM systems Journal 39, 1 (2000), 175–193.
[^21]: TEAM, G. The go programming language specification. Tech. rep.,
    Technical Report [http://golang](http://golang/). org/doc/doc/go spec.
    html, Google Inc, 2009.
[^23]: VARIOUS. No papers have been published on onie; see onie.org.
[^24]: VARIOUS. No papers were published; see perllinux.sourceforge.net.
[^25]: WATSON, G. R., SOTTILE, M. J., MINNICH, R. G., CHOI, S.-E., AND
    HERTDRIKS, E. Pink: A 1024-node single-system image linux cluster. In High
    Performance Computing and Grid in Asia Pacific Region, 2004. Proceedings.
    Seventh International Conference on (2004), IEEE, pp. 454–461.
[^26]: WELLS, N. Busybox: A swiss army knife for linux. Linux J. 2000, 78es
    (Oct. 2000).
