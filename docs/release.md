# Publishing a release

This project is using semantic versioning.

First, make sure the release tools are installed: 

    npm install -g release-tools

Publishing a release is a two step process, involving first a release step, followed by a publish step. The command for publishing a release is:
    
    npm run release -- <args>... ; npm publish --access public
    
### Create release step

The release step creates a release and it executes the following sequence of actions (for now identical to that of npm_bump):   

* Check the project contains a `CHANGELOG.md` file.
* If there is a changelog, check if the changelog contains the needle `## Upcoming` and replace it with the new version and the current timestamp.
* If there is a changelog, commit the changes in changelog with the commit message `Add changes in version: v<version>`.
* Run `npm version` (which sets the version of your package.json to the new value), commit the change with the commit message `Bump to version: v<version>` and finally create a tag for the new version á la `v<version>`.
* Finally push your changes and your tags to the remote server (via git).

The arguments available to the prepare-release command are: 

    npm run release -- <arguments>...
    
    Arguments:
    --bugfix, -b         Bump the package to the next bugfix version.                                                                          
    --patch, -p          Bump the package to the next patch version. This is an alias for --bugfix.                                            
    --minor, -m          Bump the package to the next minor version.                                                                           
    --major, -M          Bump the package to the next major version.                                                                                 
    
### Publish step
  
The release step executes the following sequence of actions:
  
* Sort the list of version tags (those starting with v) and pick the latest version.  
* Run `npm publish --access public`  