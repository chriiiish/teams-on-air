#!/bin/bash

# Sets up the Git repository hooks

# Precommit Hooks
if test -f ".git/hooks/pre-commit"; then
    rm .git/hooks/pre-commit
fi
tee -a .git/hooks/pre-commit << EOF
# Don't let a commit be made to the credentials config file without the permission to do so
git diff --cached --name-only | if grep --quiet "config.h"
then
    if test -f "ESP8266-Board/Teams-Lighting-Controller/commit-my-credentials"; then
        rm -rf "ESP8266-Board/Teams-Lighting-Controller/commit-my-credentials";
        exit 0;
    else
        echo "You are making changes to a credentials file...";
        echo "Either: ";
        echo "  1 - Do not commit the config.h file, OR";
        echo "  2 - Create a blank file called 'commit-my-credentials' file in the same directory"
        echo "";
        echo "This commit has not been completed.";
        exit 1;
    fi
fi
EOF
chmod gou+x .git/hooks/pre-commit;


# Commit Message Hooks
if test -f ".git/hooks/commit-msg"; then
    rm .git/hooks/commit-msg
fi
tee -a .git/hooks/commit-msg <<EOF
# Commit message must be prefixed with which module you're modifying
INPUT_FILE=\$1
START_LINE=\$(head -n1 \$INPUT_FILE)
PATTERN="^(WEB|BOARD|INFRA|ALL|CICD|MISC): "
if ! [[ "\$START_LINE" =~ \$PATTERN ]]; then
  echo "Bad commit message. Commit message must match format '{PROJECT}: message'";
  echo "  where {PROJECT} is WEB | BOARD | INFRA | ALL | CICD | MISC";
  exit 1
fi
EOF
chmod gou+x .git/hooks/commit-msg;

# Tell the user we're done
echo "";
echo "";
echo "Mission Complete.";