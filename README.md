### Team Members:

Garrett Reinhard,\
Jared Hammett,\
Parastou Ardebilianfard,\
Noah Snodgrass,\
Jose Espinzoa\
Figma Link: https://www.figma.com/team_invite/redeem/LNI3ySfmzrSdn48fP8a2Hb \

UML: https://lucid.app/lucidchart/862496ad-73c0-4e79-958d-8db5cd017bc2/edit?viewport_loc=-10%2C-10%2C1707%2C844%2C0_0&invitationId=inv_6075f452-37a3-4106-9986-106b4ec9017e \

Use Case Diagram: https://lucid.app/lucidchart/6e59db40-5738-41c8-bf19-e89843d0836d/edit?view_items=GJASVEUX6jo5&invitationId=inv_f65cae87-4e53-4e01-9ca8-17606ef9e51a \

Activity UML Diagram: https://lucid.app/lucidchart/2a15c796-0234-4499-9d15-3d2dab03d937/edit?viewport_loc=-11%2C-11%2C665%2C913%2C0_0&invitationId=inv_c944cd61-25db-460e-9d02-2ba6454ae07e \

Spotify Authentication: https://developer.spotify.com/documentation/web-api/tutorials/code-flow

Tech Spec: https://docs.google.com/document/d/1rmt0jja06XbG2fdikjKd7vPXWtoIRsLaYJIko4LYlxQ/edit?usp=sharing\

Code Coverage Report as of 03/13/25\
<img width="709" alt="Screenshot 2025-03-14 at 2 22 42 AM" src="https://github.com/user-attachments/assets/a1ff0a59-a9fd-4c0d-8c1d-bcb667ab63ce" />

## 📌 Code Style Guide

To ensure consistency across the codebase, all contributors must follow these guidelines:

### **ESLint + Prettier Rules**

- Our project follows **ESLint** and **Prettier** for code formatting and linting.
- The ESLint rules are defined in [`eslint.config.js`](./eslint.config.js).
- Prettier ensures automatic formatting based on the `.prettierrc` configuration.

### **Style Guide(s)**

- JavaScript & React: [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Prettier Formatting: [Prettier Official Docs](https://prettier.io/docs/en/options.html)
- Linting Rules: [ESLint Recommended Rules](https://eslint.org/docs/latest/rules/)

---

## 🔧 Setting Up Your IDE for This Project

### **1️⃣ Install VS Code Extensions**

If you're using **VS Code**, install the following extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) (for linting)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (for auto-formatting)

### **2️⃣ Enable Auto-Formatting**

Go to **VS Code Settings (`Ctrl + ,`)**, then enable:

- **Format on Save**: Automatically applies Prettier formatting on file save.
- **Default Formatter**: Set Prettier as the default formatter for JavaScript & JSX.

  Add this to your VS Code settings (`settings.json`):

  ```json
  {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "[javascript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[javascriptreact]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[typescript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[typescriptreact]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
  }
  ```

### **3️⃣ Run Prettier and ESLint in Your Local Dev Environment**

After cloning the repo, set up linting and formatting by running:

```sh
npm install  # Install dependencies
npm run lint-fix  # Auto-fix ESLint issues
npm run lint # Default linting call without fixes
npm run format  # Format code using Prettier
npm run format-check # Check your formats correspond with prettier configuration
```

---

## 🤝 Contributing Guidelines

- Always run Prettier and ESLint before commiting code
- follow the Airbnb Javascript Style Guide
