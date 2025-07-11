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


    June/2/2025
    Didn't do much as I'm not good at sql queries. This month I will spend time writing those queries and learning about it.
    Got know about few of them but still long way to go
    The file in the queryBuilder was way out of my digestion. I have decided that it's better to learn sql then push it under the rug.


July/11/2025
Some done with sql started with this project again. Asked help from clause and oh boy, the shit it took me, uncharted seas bitch... I didn't knew what was what at first. Created some validation copy pasted it, most of the shit went right above my head. But I do have some Idea what is going on there. But can't vibe code like this. I have to study it deeply. I imporving in the sense of quality of work I do. I have to be more focused. This reel brain need to stopped. Short attention span man. It will kill me. But I will keep coding I'm enjoying this hourly base roller coster of depressing feeling.

Good Night sweet heart ;(


July/11/2025
Today I have got to know that you can build schema validator for queries as well, (like filter, pagination, search then a queryValidator itself.)
Got to know that you also can how validator are different from the type infers. That type check for types only and how validator looks for the value. I think I still haven't understand the actual use of typescript. Then how error caught at compile time are different then run time. TS does a compile time error check. The validation errors are caught at run time. I still doesn't have a good mental map for this. I still need to study them more regoursly (this is not correct spelling I now bitch). But anyway about to call it a day. 
Hey I also got to know about genric type  man that shit is cool. you can kind of tell that I will give a type which it takes as a parameter and then it let you defined the rest of the type will be kind of fixed 


[BASICALLY]="okay so we can say T is let's the other type schema in which will also be included in the new schema that I'll build. The one you gave me vary according to what you have provided me. But the one I have build always be the same through out the whole application wherever you use me.


[GEMINI]
The useablity of genric is here that it makes a type variable, like you can chose to which type schma you want to send? "
Yes, you've hit the nail on the head with both points!

    "So here what T let's you do is insert another type of schema as parameter, Then it puts the parameter's schema in the object of array as data. and let's you add additional schema types in the meta/"

        Correct! T is exactly that placeholder. It allows you to "inject" or "insert" another Zod schema (your itemSchema) as a parameter.

        This itemSchema (which is T) then dictates the type of the elements within the data array of the new schema that paginationResponseSchema builds.

        And yes, the meta part of the new schema has its own, fixed structure that's defined directly within paginationResponseSchema, independent of T. You don't "add additional schema types" into meta using T; rather, meta is consistently defined.

    "The one you gave me vary according to what you have provided me. But the one I have build always be the same through out the whole application wherever you use me."

        Absolutely correct!

            The paginationResponseSchema function itself is a consistent blueprint. Its internal structure (data array + meta object) is always the same.

            What varies is the specific type that T represents when you use paginationResponseSchema.

            So, when you call paginationResponseSchema(userSchema), the resulting schema is for paginated users.

            When you call paginationResponseSchema(productSchema), the resulting schema is for paginated products.

            The overall shape of the pagination response ({ data: [...], meta: {...} }) remains consistent throughout your application, which is a huge benefit for API design and client-side consumption.

    "The useablity of genric is here that it makes a type variable, like you can chose to which type schma you want to send?"

        Precisely! That's the core utility of generics here. T acts as a "type variable." It allows you to:

            Define a function (paginationResponseSchema) that works with a generic item type.

            Then, at the point of using that function, you choose and specify the concrete itemSchema (and thus the type T) that the pagination response should contain.

This pattern is incredibly powerful for creating highly reusable and type-safe utilities, especially when dealing with common API response patterns like pagination, where the wrapper structure is consistent but the payload's type changes.
