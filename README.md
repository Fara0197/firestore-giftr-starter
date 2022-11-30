firebase hybrid instructions


hybrid one: firebase edit and delete 
1.  READS a list of people from the data, displays their names, birhtdays and months
2.  first person automatically selected and the gifts of person is displayed
3.  clicking on a person list item READS all gift ideas from that person and displays it as contents of the second list
4.  if either list is empty, a message is displayed "no data"
5.  clicking on ADD buttons should show the overlay plus the form
6.  once form is filled, when user clicks save, the new item should be added to database as well as updated list
7.  the bought value should be displayed as a checkbox
8.  each item should have a delete button
9.  the delete button should delelte from database and UI
10. each item should have a functional edit button
11. toggling checkbox for gift should do an update in DB
12. FINAL, host on github pages

hybrid two: authentication 
1.  first get authentication credentials from the user.
2.  Then pass those credentials to the firebase authentication SDK
3.  Then, the backend services will verify the credentials and return a response.


hybrid three: permissions
User Details and Database Details 
1. Add a users collection to your database that will hold user details for every user who signs in.
2. Add an owner property to every record in the people collection with a reference 
3. When your READ the people from the database the owner information should be added to the list items as a data- property.
4. When you ADD or UPDATE or DELETE the people data, the owner|user id information needs to be included.
5. New documents in the people collection can be created by anyone who is logged in.
6. Documents in the gift-ideas collection can be read or written by anyone who is logged in.
7. Users can only read, update, or delete their own document in the users collection.
8. Anyone can create new documents in the users collection.