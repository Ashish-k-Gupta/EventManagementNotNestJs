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


```ts
   const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['user', 'categories'],
        });
        if (!event) {
            throw new NotFoundException(`Event with ID "${eventId}" not found`);
        }
        if (event.user.id !== userId) {
            throw new UnauthorizedException('You are not authorized to update this event');
        }

        if (updateEventInput.categoryIds) {
            const categories = await this.categorySerivce.findCategoryListByIds(updateEventInput.categoryIds);
            const uniqueCategoriesDatabase = new Set(categories.map(cat => cat.id));
            const uniqueReqCategories = new Set(updateEventInput.categoryIds);
            const missingIds = [...uniqueReqCategories].filter(id => !uniqueCategoriesDatabase.has(id));
            if (missingIds.length > 0) {
                throw new NotFoundException(`Category with ID(s) ${missingIds.join(', ')} do not exist in the database`);
            }
            event.categories = categories;
        }

        Object.assign(event, {
            name: updateEventInput.name ?? event.name,
            description: updateEventInput.description ?? event.description,
            language: updateEventInput.language ?? event.language,
            ticketPrice: updateEventInput.ticketPrice ?? event.ticketPrice,
            fromDate: updateEventInput.fromDate ?? event.fromDate,
            tillDate: updateEventInput.tillDate ?? event.tillDate,
            isCancelled: updateEventInput.isCancelled ?? event.isCancelled,
        });

        return await this.eventRepository.save(event);
    }