# lottery__webapp

I have decided to use SSR for the front-end, generally more comfortable using it, and haven't built a project with it for a while. I am using EJS for this particular project.

## Project requirements
- MongoDB
- Gmail or mail service of your choice

#### Setting up project

Run either of the following
```
npm i

yarn install
```

Create a new file in the top directory nammed .env
Add the following variables and fill out accordingly

```
MONGOOSE_CONNECTION_URI=

SITE_MIN_AGE=18
MAX_LOTTERY_CAP=999
LOTTERY_CAP_HISTORY_LENGTH=30 # The length in days which the spend cap is in place for before resetting
DAY_IN_MILLISECONDS=86400000
MAX_GAME_COST=50
CURRENCY_SYMBOL=£

GMAIL_EMAIL=
GMAIL_PASS=
```

Now run the application
```
npm run dev || start

yarn dev || start
```