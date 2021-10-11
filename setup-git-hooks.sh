# Sets up the Git repository hooks

# Precommit Hooks
if test -f ".git/hooks/precommit"; then
    rm .git/hooks/precommit
fi
echo <<EOF
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
EOF > .git/hooks/precommit
chmod gou+x .git/hooks/precommit;