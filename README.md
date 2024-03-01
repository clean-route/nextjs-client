## Clean Route: Web Tool for LEAP route prediction. 

>> Please use GITBASH for as Terminal for typing your commands. 

### IMPORTANT
Before you begin with frontend setup: Make sure you've completed the backend setup and the server is up and running.

Recommended steps for bootstrapping the servers: 
1. Setup and run the ML server
2. Setup and run Go backend server
3. Setup and run frontend client

Some ASCII art to help  understand the application flow:

```

                      External Weather APIs       
                        /                          
                     /                             
Frontend(3) -> Backend (2)  - - -> ML Model (1)               

```

### Tools Prerequisites

Again before you begin, make sure you have the following installed on your system:

1. **Git:** Install Git on your computer. You can download it from the official Git website: https://git-scm.com/downloads

Verify by running: 
```bash
git -v
```

3. **Node.js and npm:** React applications require Node.js and npm (Node Package Manager) to manage packages and dependencies. Download and install them from: https://nodejs.org/

Verify by running: 
```bash
node -v
```

5. **Yarn:** Yarn is an alternative package manager to npm, and it's often preferred for React projects. Install Yarn using npm by running the following command in your terminal:

   ```
   npm install -g yarn
   ```

**Getting Started:**

Now that you have the prerequisites installed, you can set up and run a React app using `git clone` and `yarn`.

> Make sure you create a `clean-route` directory (folders:)) where all three sub-directories - `clean-route-frontend`, `clean-route-backend` and `clean-route-aws` will reside.

1. **Clone the Repository:**

   Open your terminal and navigate to the directory (in this case `clean-route`) where you want to store your React app. Then run the following command to clone the repository:

   ```
   git clone https://github.com/sadityakumar9211/clean-route-frontend
   ```

2. **Navigate to the App Directory:**

   Move into the app directory using the `cd` command:

   ```
   cd clean-route-frontend
   ```

3. **Install Dependencies:**

   Use Yarn to install the project dependencies (will take a moment as JS ecosystem is slow :|): 

   ```
   yarn install
   ```

   This will install all the required packages specified in the `package.json` file.
4. **Setup Environment Variables:**
   Rename `.env.example` file to `.env` and replace `xxxx` with your own values.

6. **Start the Development Server:**

   To start the development server and see your React app in action, run the following command:

   ```
   yarn start
   ```

   This will start the development server and open your [app](http://localhost:3000) in a web browser. The app will automatically reload whenever you make changes.
   
This will setup you up and running the frontend application on http://localhost:3000.


