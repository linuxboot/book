# Benefits of using the Go user-space environment and compiler

Go is a systems programming language created by Google. Go has strong typing,
language level support for concurrency, inter-process communication via
channels, runtime type safety and other protective measures, dynamic allocation
and garbage collection, and closures. Go has a package name notation similar to
Java that makes it clear to determine what packages a given program needs.

The modern language constructs make Go a much safer language than C. This
safety is critical for network-attached embedded systems, which usually have
network utilities written in C, including web servers, network servers
including `sshd`, and programs that provide access to a command interpreter,
itself written in C. All are proving to be vulnerable to the attack-rich
environment that the Internet has become.

Even the most skilled programmers can make mistakes that in C can be
unrecoverable, especially on network connected systems. Currently, even the
lowest-level firmware in our PCs, printers, and thermostats is
network-connected. These programming mistakes are either impossible to make in
Go or, if made, are detected at runtime and result in the program exiting.

The case for using a high-level, safe language like Go in low level embedded
firmware might be stronger than for user programs, because exploits at the
firmware level are nearly impossible to detect and mitigate.

The challenge to using Go in a storage-constrained environment such as firmware
is that advanced language features lead to big binaries. Even a date program is
about 2 MiB. One Go binary, implementing one function, is twice as large as a
BusyBox binary implementing many functions. Currently, a typical BIOS FLASH
part is 16 MiB. Fitting many Go binaries into a single BIOS flash part is not
practical. The Go compiler is fast and its sheer speed suggests a solution
of having programs compiled only when they are used. With this approach, you
can build a root file system that has almost no binaries except the Go compiler
itself. The compiled programs and packages can be saved to a RAM-based file
system. Another solution is to compile everything together into one
BusyBox-style program. Alternatively, programs can be fetched over the network,
but compiling dynamically with Go or creating a BusyBox program are the
recommended solutions.
