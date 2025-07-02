#6-20-2025

I'm leaving it here, I was just writing dto of createUser, other dto for updateUser and update password is pending, 

Then Also user service and controller also pending.

Category enitity pending

Haven't started any other service or controller yet.

#6-24-2025
I had decided that I will use zod instead of class-validator and class-transform.
I was able to implement that in the userService.
Then I had to create a validation.middleware file. (I have to see this again, how does one write this. What is exact purpose of it. I have a rought idea but I don't know it throughly.) ([x]Pending Task)

## Then I have started writing userController, goto line 23 in user controller file  ([x]Pending Task)
## I have write router after that ( [x] Pending Task)
## Also go to know that you can apply validation on query and param as well. That is news to me. Need to dig deeper on that.

Below I have written the code from LLM, because I didn't wanted to miss on this logic, later I will look into this for reference.

26-June-2025
Link1: ([text](https://g.co/gemini/share/d4aad9afc242))
Link2: ([text](https://g.co/gemini/share/7e7447351801))

what is the use of express.d.ts file

Now the auth is working, still didn't get it fully but everytime I write it the understanding gets better. This time I was able to pul the middleware where it also checks for role. If you have correct role then you can access a particular route. 
Then there also a function to check for the multiple role in the token. 
That also worked. 
But I have read and write it again and again.


28-June-2025
working in event service, In my designe a user while creating an event, send the id of categories he want to add to that event.
 
 So I have create a function to check if those id are valid, need to think if I can move it to category service rather then writing it in event service. Need to check if this is the right method and other things as well.

 will start again.


29th-June
Working on event Service, there is something I don't feel right about how the updateEvent function not feeling right.
Also check createEvent one time this is also not looking right in line 22.

30-June-2025
#### Done with all the CRUD of user, event, category, 
testing is still pending of these all modules in the postman.
Will check it think about the edge cases of the application.


[Link]='https://youtu.be/7uUl_aTbOzQ?si=LoDkne8QHmDvkmhr'
[Link]='https://youtu.be/i7kh8pNRWOo?si=Y8mnlqzLivs9zlmp'


30-June
I got to know that the order in which you define you route matters.
If you have two same type of req and going to same path it will create problem. They'll collide and maybe behave unexpectedly.
Example:
    router.get("/list-by-ids", catergoryController.findCategoryListByIds)
    router.get("/:id", catergoryController.findCategoryById)

    These two routes has created problem, because earlier I had the "findCategoryById" was before "findCategoryListByIds".
    And the problem was that When Express processes requests, it tries to match them in the order they are defined.

    When you make a request to /list-by-ids, Express processes your routes in order:

    [1.] It first encounters router.get("/:id", ...).
    [2.] It sees that /list-by-ids matches the pattern /:id, and it extracts "list-by-ids" as the id parameter.
    [3.] Therefore, catergoryController.findCategoryById is called, and req.params.id will be "list-by-ids".

    1-june-2025;

    I'm calling it a day today, was too tired, couldn't do much.
    Next task [Link]: [text](https://g.co/gemini/share/9e58d0a72cef)

    APIs are working need to see what is the next task that we have work on.
    Just test the Event API, I have tested the for create rest are pending.
    Bye Good nigth