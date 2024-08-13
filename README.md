# Github Issues: Wellness Quest
## For detailed installation instructions view the guide in Guide.pdf
## Backend
### Requirements to run:
- Needs [Docker](https://www.docker.com/) installed. If you are not using Linux, Docker will be running in a Linux VM, so don't try to run this without sufficient RAM or thrashing will occur.
- Needs [NodeJS](https://nodejs.org/en) installed

### To set up
- In ./backend/server/, copy .env.empty to .env (a .env would contain sensitive information so it is not in the repo) but make sure it still exists
- Run `npm install` in ./backend/server/ to download dependencies

### To run (HTTP)
- Run ./backend/docker-compose.yml in Docker (desktop application and VM if not on linux)
- Run `npm run dev` in ./backend/server/ to start server
- Go to `localhost:8080` to access phpmyadmin

### To run (HTTPS)
- Run ./backend/docker-compose.yml in Docker (desktop application and VM if not on linux)
- Ensure the env variables are set for wellnessquest.uk
    - HTTPS_Key={key location}
    - HTTPS_Cert={server cert location}
    - HTTPS_CA={ca cert location}
- Run `npm run prod` in ./backend/server/ to start server
- Go to `localhost:8080` to access phpmyadmin

### To test
- Ensure you have [Postman](https://www.postman.com/) installed on your machine.
- Complete the setup and run of the server as outlined above.
- Open Postman.
- Locate the **Testing** folder in your project directory.
- Drag and drop the file named **Wellness Quest API.postman_collection** into Postman.
- Once imported, you'll see the **Wellness Quest Collection** in Postman.
- Click on the three dots next to the collection name and choose **Run Collection** to execute all tests sequentially.
- Alternatively, you can run tests for each folder within the collection individually.
- For more granular control, you can manually send each request and review the associated test results.
- Please note that one test case, specifically the one retrieving all finished challenges for the logged-in user, may fail if the necessary conditions are not set manually using phpMyAdmin.

## Frontend
### Requirements to run
- Backend must be running otherwise good luck doing anything

### To set up
- Run `npm install` in ./frontend/ to download dependencies (may take a while)

### To run (HTTP)
- Run `npx expo start` in ./frontend
- To run in web browser, press `w` in Expo CLI (will take a while) and will appear in `localhost:8081`
- To run in Android emulator, install an Android Studio and have an emulator instance running and press `a` in Expo CLI (will take a while and a lot of RAM)

### To run (HTTPS)
- Add the env variable EXPO_ENV=production
- Run `npx expo start` in ./frontend
- To run in web browser, press `w` in Expo CLI (will take a while) and will appear in `localhost:8081`
- To run in Android emulator, install an Android Studio and have an emulator instance running and press `a` in Expo CLI (will take a while and a lot of RAM)

### To run on own mobile device
- Get the IP of the server for the network you are working in. Inside a local network it should be something like `192.168.0.1`. Set this as the environment variable `SERVER_IP`
- Run `npx start expo --tunnel` to start a tunneling service with ngrok. It may help to add `--clear` to clear the cache as stale cache can create issues.
- Make sure it is in Expo Go mode
- Have the phone in light mode as dark mode is broken
- Use the QR code with the Expo Go mobile application
- Wellness Quest should load (may take a minute or two)
- This is ran with *native code*
- Make sure location services are active and Expo Go can use location at all times

### Other information
- Ignore ./deploy/ for now. Not much going on.
- Recommend something like Postman or Thunder Client VS Code extention to manually test API


  

## Project Contents

- **Final_Report.pdf**:
	PDF containing our Final Report

- **Guide.pdf**:
	Detailed guide on the application

- **Security Documents** \[Folder\]:
	Documents created by the security lead
	**Note:** For best experience download and open the files on system. Github has trouble rendering these files

	- **2024-04-12-ZAP-Report-localhost.html**:
		ZAP Proxy report after automatic scan
		**Warning:** Do not open in github (can cause hard crash) download and open using browser.

	- **Misuse[SecurityRequirementID].png**:
		Misuse case example diagrams for each of the security requirements
	
	- **Security Requirements.docx**:
		Contains security requirements for the project with each having an ID, example use case, example misuse case

	- **Security_Assessment_030824.docx**:
		Manual security assessment done at the start of the project

	- **Threat model.docx**:
		Threat model document using the OWASP template

	- **Threat_Report3.htm**
		Threat Report generated from Microsoft Threat Modeling tool on the login/registration use case
		**Warning:** Do not open in github (can cause hard crash) download and open using browser.

	- **ZAP Active Scan (3_25_24).docx**:
		Shows the plugins ran and the number of alerts generated from an automatic ZAP Proxy scan

- Testing \[Folder\]:
    Documents created by the testing lead

    - **RTM_GitHubIssues.doc**:
        Requirement Tracabilities Matrix for the project

    - **TestCases_Backend_GitHubIssues.docx**:
        Test cases for the backend

    - **TestCases_Frontend_GitHubIssues.docx**:
        Test cases for the frontend

    - **TestPlan_GitHubIssues.doc**:
        Test plan for the project

    - **Wellness Quest API.ponstman_collection.json**:
        Postman json for testing the backend


- **backend** \[Folder\]:
	Holds all the files/folders for the creation of the backend of the application including the docker containers and NodeJS server.

	- **mysql/init** \[Folder\]:
		- **_init.sql**:
			Creates the WellnessQuest database if it does not exist already

	- **server** \[Folder\]:
		Holds the files/folders for the creation of the NodeJS server

		- **api** \[Folder\]:
			Holds the models and routes

			- **models** \[Folder\]:
				Holds the Sequelize models

				- **Challenge.js**:
					Sequelize model for the creation of the Challenge database
				
				- **User.js**:
					Sequelize model for the creation of the User database

				- **UserChallenge_Join.js**:
					Sequelize model that creates the join table for the Challenges and Users

			- **routes** \[Folder\]:
				Holds the Express routes for the server
				
				- **challengeRoutes.js**:
					Contains express routes that handle the modification of challenges and their associations with the users

				- **userRoutes.js**: 
					Contains express routes that handle the create, modification, and deletions of users and their sessions

		- **config** \[Folder\]:
			Holds the functions and config files for the server

			- **auth.js**:
				Functions for checking the authentication status of the user

			- **database.js**:
				Handles the Sequelize connection to the database

			- **initTables.js**:
				Initial tables that will be added to the database on startup

			- **relations.js**:
				Relationships among models and starts teh database initialization process

			- **sessions.js**:
				Handles both the cookies for the users and the session with the MySQL database

		- **test** \[Folder\]:
			Holds functionality tests for the server

			- **_userRoutes.js**:
				Tests userRoutes for functionality

		- **.env.empty**:
			Temporary file that holds the enviromental varables and should be copied to .env.
			**NOTE:**This file should not be used in a production environment

		- **package-lock.json**:
			Exact packages that should be installed

		- **package.json**:
			Packages and scripts that should be installed and ran

		- **server.js**:
			NodeJS server for the backend application

	- **docker-compose.yml**:
		Docker setup files for both the mysql and phpmyadmin files

-  **deploy** \[Folder\] \[Unused\]:

-  **frontend** \[Folder\]:
	Holds all the files for the frontend of the application

	- **app** \[Folder\]:
		React files for the different pages of the app

		- **(dashboard)** \[Folder\]:
			React files for the dashboard page

			- **_layout.tsx**:
				Layout for the dashboard

			- **challenges.tsx**:
				UI screen components for the challenges tab

			- **dashboard.tsx**:
				UI screen components for the items on the dashboard tab

			- **history.tsx**:
				UI screen components for the challenges in the history tab

		- **(login)** \[Folder\]:
			React files for the login page

			- **_layout.tsx**:
				Layout for the login page

			- **index.tsx**:
				UI screen components for the handling for the login process

		- **+html.tsx**:
			Root html header used for Web app

		- **+not-found.tsx**:
			404 screen

		- **_layout.tsx**:
			Root layout

		- **register.tsx**:
			UI screen components for Registration page

		- **sync.tsx**:
			Fucntions for the app syncing with server

	- **assets** \[Folder\]:
		Files to be used by the app

		- **Icons** \[Folder\]:
			Icons to be used by app

		- **fonts** \[Folder\]:
			Fonts to be used by the application

		- **images** \[Folder\]:
			Images to be used through application

	- **components** \[Folder\]:
        Frontend app components

		- **__tests__** \[Folder\]:
			Holds tests for rendering

		- **ChallengeMapper.tsx**:
			Function for mapping the challenges to on screen components

		- **ConfirmChallengeModel.tsx**:
			Handles the different types of popups that appears when clicking on challenges at different states

		- **FormInput.tsx**:
			Handles the login/register screen form components

		- **Images.tsx**:
			Assigns the proper images to the associated challenges by challenge type

		- **Location.tsx**:
			Handles the collection, storing, and release of location data

		- **Progressbar.tsx**:
			Handles the creation of progress bars for the challenges

		- **ToastFactory.tsx**:
			Handles toast alerts

		- **platform.ts**:
			Determines the constanst for what device type or mode the app is running in: android, ios, web

		- **useClientOnlyValue.ts**:
			Syncs server with client

		- **useClientOnlyValue.web.ts**:
			Syncs server with client for web

		- **useColorScheme.ts**:
			Sets the apps color scheme

		- **useColorScheme.web.ts**:
			Sets the apps color scheme for web

	- **constants** \[Folder\]:
		Constants to be used throughout app

	- **app.json**:
		Expo app configuration file

	- **axiosConfig.ts**:
		Creates axios instance to be used through the app

	- **babel.config.js**:
		Babel configuration file used to support environment varialbes

	- **package-lock.json**:
		Exact packages that should be installed

	- **package.json**:
		Packages and scripts that should be installed and ran

	- **tsconfig.json**:
		Configuration for the typescript portion of the project