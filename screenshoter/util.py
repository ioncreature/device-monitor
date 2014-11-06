#############################################################################################
#############################################################################################
#############################################################################################
#############################################################################################
#############################################################################################

import os

from devs import printers, simplates

colors = {}
colors['cyan']   = '\033[96m'
colors['purple'] = '\033[95m'
colors['blue']   = '\033[94m'
colors['green']  = '\033[92m'
colors['yellow'] = '\033[93m'
colors['darkY']  = '\033[33m'
colors['red']    = '\033[91m'
colors['end']    = '\033[0m'

date = None

def ColorMessage(msg, color):
    return '%s%s%s' % (colors[color], msg, colors['end'])

def nonBlockReadline(output):
    import fcntl
    fd = output.fileno()
    fl = fcntl.fcntl(fd, fcntl.F_GETFL)
    fcntl.fcntl(fd, fcntl.F_SETFL, fl | os.O_NONBLOCK)
    try:
        return output.readline()
    except:
        return None

def execShCommand(command):
    import sys
    from subprocess import Popen, STDOUT, PIPE

    print ( ColorMessage('bash command: ', 'blue') + ColorMessage(command, 'yellow'))
    sys.stdout.flush()

    proc = Popen(command, stdout=PIPE, stderr=PIPE, shell=True)

    result = ""
    errRes = ""

    while True:
        nextline = nonBlockReadline(proc.stdout)
        proc.stdout.flush()
        
        if (nextline):
            result = result + nextline
            sys.stdout.write(nextline)
            sys.stdout.flush()

        errline = nonBlockReadline(proc.stderr)
        proc.stderr.flush()
        
        if (errline):        
            errRes = errRes + errline
            sys.stdout.write(ColorMessage(errline.strip('\n'), 'darkY') + "\n")
            sys.stdout.flush()

        if (nextline == '' and errline == '' and proc.poll() != None):
            break

    output, err = proc.communicate()
    exitCode = proc.returncode

    if (exitCode != 0):
        print (ColorMessage('shell error: ' + errRes, 'red'))
        raise Exception("Error running shell command: %s" % (command))

    return result

def sshExecCommand(ssh, command, requestX = False):
    import paramiko
    import sys

    result = ""

    try:
        print ( ColorMessage('ssh command: ', 'blue') + ColorMessage(command, 'yellow'))

        sys.stdout.flush()
        
        chan = ssh.get_transport().open_session()
        if requestX:
            chan.request_x11()

        chan.exec_command(command)

        import StringIO
        contents = StringIO.StringIO()
        error = StringIO.StringIO()

        while not chan.exit_status_ready():
            localError = StringIO.StringIO()
            if chan.recv_ready():
                data = chan.recv(1024)
                while data:
                    contents.write(data)
                    if data.find('\n'):
                        for s in data.split('\n'):
                            if (s != ''):
                                sys.stdout.write('ssh: ' + s + '\n')
                    else:
                        sys.stdout.write(data)
                    data = chan.recv(1024)

            if chan.recv_stderr_ready():
                error_buff = chan.recv_stderr(1024)
                #while error_buff:
                error.write(error_buff)
                localError.write(error_buff)
                #error_buff = chan.recv_stderr(1024)
                print (ColorMessage('ssh error: ' + localError.getvalue().strip('\n'), 'red'))

        status = chan.recv_exit_status()

        if status != 0:
            raise Exception("SSH command failed: %s" % command)
    except Exception:
        import traceback
        traceback.print_exc()
        raise Exception("SSH command failed")

    return contents.getvalue()

def processCommandOnDevice(srv, username, port, command, password, date, requestX = False):
    try:
        import paramiko
        ssh = paramiko.SSHClient()
        ssh.load_system_host_keys()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname=srv, username=username, port=port, password=password)
        import re

        match = re.match(r"(.*)#date#(.*)", command)
        if match:
            command = "%s%s%s" % (match.group(1), date, match.group(2))

        sshExecCommand(ssh, command, requestX)
    except Exception, e:
        print ( ColorMessage(str(e), 'red'))

def processScpCommand(dev, srv, username, port, password, fr, to):
    import re

    match = re.match(r"#remote#(.*)", fr)
    if match:
        fr = "%s@%s%s" % (username, srv, match.group(1))

    match = re.match(r"(.*)#name#(.*)", fr)
    if match:
        fr = "%s%s/%s" % (match.group(1), dev, match.group(2))

    match = re.match(r"#remote#(.*)", to)
    if match:
        to = "%s@%s%s" % (username, srv, match.group(1))

    match = re.match(r"(.*)#name#(.*)", to)
    if match:
        to = "%s%s/%s" % (match.group(1), dev, match.group(2))

    if (not ("@" in fr)):
        base = os.path.dirname(fr)
        if (not os.path.exists(base)):
            os.makedirs(base)

    if (not ("@" in to)):
        base = os.path.dirname(to)
        if (not os.path.exists(base)):
            os.makedirs(base)

    command = " sshpass -p '%s' scp -o ConnectTimeout=8 -o StrictHostKeyChecking=no -P %s -r %s %s" % (password, port, fr, to)

    print (command)
    os.system(command)


def main(printerSshCommands, printerScpCommands, simplateSshCommands, simplateScpCommands):
    import argparse

    date = execShCommand('date +"%Y-%m-%d %H:%M:%S"').rstrip('\n')

    try:
        parser = argparse.ArgumentParser(description='Deploy server.')

        parser.add_argument(
            '--type', 
            dest='type',
            type=str,
            nargs=1,
            action='store',
            required=True,
            help='device type'
        )

        parser.add_argument(
            '--scp',
            dest='scp',
            action="store_true",
            help='scp'
        )

        parser.add_argument(
            '--cmd',
            dest='cmd',
            action="store_true",
            help='cmd'
        )

        parser.add_argument(
            '--X',
            dest='X',
            action="store_true",
            help='X'
        )

        args = parser.parse_args()

        devType = args.type[0]
        scp = args.scp
        cmd = args.cmd
        requestX = args.X

        if (scp == False and cmd == False):
            raise Exception("Select type: [scp, cmd]")

        password = None
        devices = ()
        commands = []
        scpArgs = []
        user = None

        if devType == 'printer':
            devices = printers
            commands = printerSshCommands
            scpArgs = printerScpCommands
            password = 'thermal'
            user = 'root'
        elif devType == 'simplate':
            devices = simplates
            for c in simplateSshCommands:
                commands.append("su -c '%s'" % c)
            commands = simplateSshCommands
            scpArgs = simplateScpCommands
            password = 'ifree'
            user = 'ifree'
        else:
            raise Exception("invalid dev type %s" % (devType))

        if (cmd):
            for dev in devices:
                print (ColorMessage("Processing dev: %s" % (dev[0]), 'green'))
                for command in commands:
                    processCommandOnDevice(dev[1], user, dev[2], command, password, date, requestX)

        if (scp):
            for dev in devices:
                print (ColorMessage("Processing dev: %s" % (dev[0]), 'green'))
                for arg in scpArgs:
                    processScpCommand(dev[0], dev[1], user, dev[2], password, arg[0], arg[1])


    except Exception, e:
        import traceback
        traceback.print_exc()
        print ( ColorMessage(str(e), 'red'))
