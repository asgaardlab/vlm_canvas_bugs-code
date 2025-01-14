# Setup Guide

Follow these steps to set up the development environment for the project.

**Commit SHA**: `35cddb7be626b8faaed92f4aa7a5dc24d653c97f`

**Date**: `May 29, 2024`

## Steps to Resolve the Issue

1. **Update Node.js and npm:**
   - Ensure you have Node.js version 18 installed and in use. This step is crucial to avoid compatibility issues.
   ```bash
   # Update node to version 18 using nvm
   nvm install 18
   nvm use 18

   # Update npm
   npm install -g npm@latest
   ```

2. **Install Dependencies:**
   - Install the necessary dependencies for the project using npm.
   ```bash
   npm install -D
   ```

3. **Install Missing Dependencies:**
   - Manually install the missing `@pixi/mesh-extras` package that was causing the build errors.
   ```bash
   npm install @pixi/mesh-extras
   ```

4. **Verify Dependency Tree:**
   - Use the `npm ls` command to inspect the dependency tree for any unmet dependencies. This helps ensure all necessary peer dependencies are correctly installed.
   ```bash
   npm ls
   ```

By following these steps, you ensure that you are using the correct version of Node.js and npm, have installed all project dependencies, and have resolved any potential dependency issues. This allows `npm run serve` to run successfully.