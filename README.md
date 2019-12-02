<div align="center">
    <img src="https://d.sebbo.net/icon-9b41BcJHq5A6KmhzKaBNTlT7CxidZILVDWsvlySt1ejIkM55xjcXSIzWXqGJzFfHlL61oASBAiwTPS72ctuR7PakJ6QSCBSU8qvy.svg" width="180" /><br />
    <br /><br /><br />
</div>

[![Status](https://git-badges.sebbo.net/104/develop/build)](https://github.com/ubud-app/server)

## 🧐 What's this?

People who often freeze food may know the problem: you lose track of your freezer and chaos breaks out. To prevent this 
from happening to me, I wrote this Mini-WebApp to record the contents of the subject. A connected label printer can be 
used to automatically generate pretty labels for each entry, which can be stuck to the frozen - thus eliminating the need 
for ugly handwritten labels. The printed QR code allows the entry to be removed quickly and easily.

<br />

## 🖼 Example Label

![Foto](https://d.sebbo.net/89FA09A0-B6E0-4797-8D3B-42796971DCAA-YTCKPWbAVoqYARMJf9cNTyZb02mA1TD9YFKr15bixTJ8PFrKsZ7Hodb8Y91w4cyoceL4jRVUsr4C0z3ktlGZBCrgcBcz6e6Gtljy.jpg)

<br />

## 🎉 Features

- Optimized for mobile use
- Easy to use [docker container](https://hub.docker.com/repository/docker/sebbo2002/freeze-it)
- Connection of SQLite, Postgres or MySQL with [sequelize.js](https://sequelize.org/)
- Connection to label printer with [CUPS](https://www.cups.org/) (code adapted to 62mm wide labels)
- [Paprika App](https://www.paprikaapp.com/) integration to create meals
- Calendar integration to create meals

<br />

## 🔧 Configuration
| Environment Variable | Default Value | Description |
|:------- |:------------------- |:------------------ |
|DATABASE|mysql://localhost/freeze-it|Database Connection URI|
|PAPRIKA_USERNAME|-|Paprika App Username|
|PAPRIKA_PASSWORD|-|Paprika App Password|
|CALENDAR_URL|-|Calendar URL Feed|
|PRINTER_URL_PREFIX|-|WebApp URL Prefix to generate QR Codes|
|PRINTER_NAME|-|Printer Name|
|PRINTER_HOST|-|Printer Host|

<br />

## 👩‍⚖️ Legal Stuff

- [General terms and conditions](https://github.com/ubud-app/server/blob/develop/Terms.md)
- [Privacy Statement](https://github.com/ubud-app/server/blob/develop/Privacy.md)
- Icon made by [Freepik](https://www.flaticon.com/authors/freepik) from [www.flaticon.com](https://www.flaticon.com/)
