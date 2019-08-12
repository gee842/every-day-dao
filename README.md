# every-day-dao
Upon Registration, sends a random verse from the Dao Te Ching on a 24 Hour Schedule

## Setup

## Mailing Account

Set up a mail-account.txt in the following format, with the account you want to use to send the emails:
```
provider        eg. gmail
email account       eg. foobar@gmail.com
password        eg. hunter12

```
You may need to change mail-provider specific settings in order for the app to be allowed to connect. 

```Example for gmail: https://support.google.com/mail/answer/78754```

## Text database

The program will set up a list.csv containing registered users, upon first registration.
  


## Usage

endpoints:

Register a User:
http://localhost:800//?action=register&email=john.smith@gmail.com

Unsubscribe a User:
http://localhost:800//?action=unsub&email=john.smith@gmail.com
