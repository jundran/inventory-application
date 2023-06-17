# inventory-application

## Live
https://inventory-ml9n.onrender.com/

## Description
TOP - Inventory Application project

This is an inventory management application. It catalogues items available for sale in in a store along with stock counts, descriptions, prices etc. The user can view, create, edit and delete products and the categories that they belong to using the app. They can upload images and thumbnails using multer middleware. Data is persisted to a cloud hosted MongoDB database. PUG templates serve the front end views using Express. As this is a practice project it is using free tier hosting on render.com. A limitation of the free tier is that it does not allow for persistent storage so images will not be saved across server restarts but, in the code, I have implemented functionality to save uploaded images and delete them from the database and from the file system. The initial data for this app is populated from the [Dummy JSON](https://dummyjson.com) API as it would be very time consuming and tedious to manual enter all this data myself. The app also makes use of MongoDB aggregation pipeline to generate dynamic statistics about the inventory which you can see on the homepage.

## Requriements
https://www.theodinproject.com/lessons/nodejs-inventory-application

## Data
Database initially populated with item and category data fetched from https://dummyjson.com/
