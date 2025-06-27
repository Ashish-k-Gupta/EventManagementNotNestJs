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


```typescript

import z from 'zod';


export const UpdateEventSchema = z.object({
 name: z.string().min(3, "Event name must be at least 3 character").optional(),
    description: z.string().min(3, "Event description must be at least 3 character").optional(),
    language: z.string().min(2, "Language must be at least 2 character").optional(),
    ticketPrice: z.number().min(0, "Ticket price cannot be negative").optional(),
    fromDate: z.string().refine(val => !isNaN(Date.parse(val)),{
        message: 'Invalid Date Format'
    }).optional(),
    tillDate: z.string().refine(val => !isNaN(Date.parse(val)),{
        message: "Invalid Date format"
    }).optional(),
    category: z.array(z.string().min(3, "category name must be at least 3 character")).min(1, "Event must have at least 1 category").optional(),

    isCancelled: z.boolean().optional(),

}).superRefine((data, ctx) =>{
    const fromDateProvider = typeof data.fromDate === 'string';
    const toDateProvider = typeof data.toDate === 'string';

    let fromDate
})