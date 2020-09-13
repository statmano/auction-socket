# auction-socket
A websocket based auction system for friends to compete against each other (original purpose for fun times watching horse racing).

## Overall Goal
* Two users are able to use the app simulataneously via the browser.
* Each user is assigned a bankroll amount ($100 default, should be able to edit though)
* A list of items (horses in a race being the original purpose) that can be nominated
* Each user has the ability to enter an amount without the other seeing within a timeframe, amount defaults to $1 if nothing is entered.
* After timeframe (countdown) ends, bids are revealed and the item goes to the user with the highest bid.
* The item is removed from the list/pool and placed into the users list ("stable")
* The amount of the bid is deducted from the winning user's bankroll
* Another item is nominated and the process repeats until all items have been auctioned
* Users bankrolls can never drop below zero
* Both bankrolls combined can never be less than the amount of remaining items yet to be auctioned.

WIP More to come
