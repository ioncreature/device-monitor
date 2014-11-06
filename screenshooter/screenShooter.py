#############################################################################################
#### Parameters
#### type - [printer, simplate]
#############################################################################################

printerSshCommands = [
    "ls -la /disk",
    "rm /disk/1.png",
    "cd /disk && export DISPLAY=:0.0 && ./ScreenShooter 1.png",
]

printerScpCommands = [
    ('#remote#:/disk/1.png', "./ScreenShots/#name#")
    #('./ScreenShooter', '#remote#:/disk/')
]

simplateSshCommands = [
    "export DISPLAY=:0 && cd /home/ifree/deployment/ && ./xshot 1"
]

simplateScpCommands = [
    ('#remote#:/home/ifree/deployment/1.tga', './ScreenShots/#name#')
    #('../xshot', '#remote#:/home/ifree/deployment/')
]

#############################################################################################
#############################################################################################
#############################################################################################
#############################################################################################
#############################################################################################

if __name__ == "__main__":
    import util
    util.main(printerSshCommands, printerScpCommands, simplateSshCommands, simplateScpCommands)
