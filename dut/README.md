# DUT, a simple Device Under Test utility.

Points of contact: [Ron Minnich](https://github.com/rminnich)

DUT is a simple Device Under Test program that gives you control of a node. It is intended to make
very fast startup and control easy.

DUT is one program implementing three operations. The first, tester, is run on a test control system, such as your desktop;
the second, called device, is run on the device; the third, called ssh and also run on the device, starts an
ssh server assuming one is present.

DUT is intended to be very limited, with more sophisticated operations, should they be
needed, being done over SSH.

DUT is found at github.com:linuxboot/dut.

This chapter describes how we build and use DUT.

## Components

DUT is intended to be built into a u-root image. First one must fetch it:
```
go get github.com/linuxboot/dut
# ignore the warning message.
```

DUT source tree is structured such that a program called uinit is produced. This is convenient for u-root usage.

Building it into a u-root image is easy:
```
go run $(GOPATH)/src/github.com/u-root/u-root -build=bb minimal github.com/linuxboot/dut/uinit
```

I almost always add an sshd to u-root; it's just too handy. U-root sshd does not support
passwords, so you have to supply the public key:
```
go run $(GOPATH)/src/github.com/u-root/u-root -build=bb -files key.pub minimal  github.com/linuxboot/dut/uinit   github.com/u-root/u-root/xcmds/sshd
```

### DUT on the device
On boot, the standard init program will find dut, and run it. The standard mode on a device
is device mode, and dut will bring up the ethernet, currently
using 192.168.0.2, and assuming the tester is 192.168.0.1 (this should be fixed ...).
It will then attempt to connect to a uinit running in 'tester' mode on 192.168.0.1. Once connected, it functions
as a server and waits for requests.

### DUT on the controller
Running on the controller is easy:
```
uinit -m tester
```

On the controller, the program waits for a connection and then starts issuing commands to the device.
The controller has the option of calling the following RPC functions:
```
RPCWelcome - return a welcome message
RPCExit - exit the testing mode
RPCReboot - reboot the system
RPCKexec - kexec a kernel
RPCSsh - start the sshd
```

Each of these RPCs takes arguments and returns a result, with Welcome being the most fun:
```
______________
< welcome to DUT >
  --------------
         \   ^__^
          \  (oo)\_______
             (__)\       )\/\
                 ||----w |
                 ||     ||
```

The current tester mode performs an RPC sequence I use for DXE cleaning, namely, a Welcome, followed by a Reboot, followed
by a Welcome. This sequence verifies that I can get network going from power on, do a reboot, and reconnect after
a reboot. It's been good for finding out if a particular DXE can be removed.

Once the second Welcome has happened, if an sshd is installed, it will have been started, and you can do additional commands.

# Future work

Obviously, much more can be done. But this is a useful foundation on which to build DUT environments.
