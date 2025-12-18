# BITCOIN ADDRESS TRANSACTION HISTORY
#### Video Demo:  https://youtu.be/AY7wNrfD8S8
## Description:

### Context and purpose:

This project aims at creating a very simple web application which allows to get a synthethic view of the activity of a given Bitcoin public address.
As you may know, Bitcoin blockchain is plublic and all the transactions are can be extracted. 
There are existing web sites on which it's possible to enter a public address and you will get all the address information as well as the transaction list involving this address.
The most known website for this is blockstream.info.
However, the list of transaction is not easy to read and provides many details that can harm the readiness of the page.
Blockstream proposes also an API to retrieve this information and build its own view based on extracted data.
The idea of this project is to call this API and to return information in a basic and synthetic way.

### Application description:

The application is a single page application which is loaded only once at the beginning.
The input form is in the navigation bar and expect a public Bitcoin address as input.
After submission, if the input address actually exists (meaning is referenced on the blockchain), then the summary information of the address are displayed :
- Address
- Balance (based on confirmed transactions)
- Number of transactions involving this address in the entire blockchain history
- Unconfirmed transaction and unconfirmed amount (based on the memory pool data)

Then, the transaction history is displayed with the most recent up.
The initial API call only loads the first 25 transactions but the next ones are loaded just by scrolling down the application screen.

Each transaction is shown with the following attributes :
- Flow direction
- Amount
- Old and new balance (in satoshis and BTC)

### Project architecture:


#### Back-end :


The back-end is written in Python and uses Flask as learnt during the CS50 class.
Initially the model was the "finance" practice.
There are 2 python files:
- app.py
- helpers.py

app.py contains the http routes.
There are actually 3 routes in the application.

##### Route1: Index :
This is the home route and it cannot be simpler. It just calls index.html file, nothing more

##### Route2: Load initial transactions:
This route is called using the GET method after the BTC address has been submitted from the unique index page form.
It is called with the address as unique argument.
If the address is valid, the route function calls another function, located in helpers.py which calls a first API which returns a json file containing the main address information.
The python function itself returns a dictionary.
In case of success, another function, also located in helpers.py calls a second API to retrieve the list of transaction related to this address.
The python function itself returns a list of dictionary (1 dictionary per transaction)
Both objects (address information dictionary and transaction history list) are "jsonified" and returned by the route function.

##### Route3: Load next transactions:
The second important route is called after the user scrolls down the page result in order to get the next most recent transactions from the list.
As we will see later, this route is only called in case the input address counts more than 25 transactions in its history.
This route takes more arguments in addition to the BTC address.
It also takes as input the oldest transaction id and the oldest computed balance at the time of this transaction.
From that, the route function calls the same python function in helpers.py that retrieves the transaction history.
However, this call is done with the arguments mentionned just before. This data, especially the transaction id, is used by the API call to get the proper transaction list in the continuity of the previous call.


As mentioned above, helpers.py contains only 2 functions which both call different apis from the same base API (https://blockstream.info/api)

- get_address_info:
This function is called only at the initial search.
Using the "requests" python library, it fetches a json from the api.
The API response is stored in a dictionary which is returned by the function.  

- get_tx_history:
This function is called from 2 different contexts.
First, right after the address info call to fetch the most recent transactions.
Then, whenever the user scrolls down on the web page and as long as older transactions exists.
The api called on retrieve batches of 25 transactions.
As argument it takes the address id and the id of the last transaction called before (so that the API starts extracting the transactions just earlier to this last one).
the API response is stored as a list of dictionary using a for loop.

##### Back-end design considerations:

Initially, my design was based on several templates and I was using Jinja to manage the html display logic.
But as I was building the project, I was learning more and more about javascript and I finally ended up with a single page application design where there was no need for several templates and I could manage the dynamic display fully in JS in the front-end. 

I also intended to store temporarilly data in a Database in order to apply what we have seen during the CS50 class.
Finally, I found out that the storage of information on server side was not useful and not very in line with the user's privacy demands.
I am also using DB and SQL already a lot in my professional life, so I consider that I don't really need to practice this part that much and preferred to dedicate my time more on learning new things like javascript features.


#### Front-end :

The front-end items are located under the static folder with:
- index.html
- styles.css
- js (folder):
    - main.js
    - controller.js
    - dom.js
    - observer.js
    - render.js
    - state.js
    - utils.js
    - api.js
- img -> favicon.ico

As mentioned earlier, the application is a single page application.
The different routes are called by javascript without reloading of the main page and results are displayed dynamically on this page.
As I am completely new to this, I spent a lot of time finding the best architecture for the application itself and for the project folder structure as my main.js was getting bigger and bigger.
For this aspect of the project, I relied a lot on advices from chatGpt.

##### index.html:
This is the single page where everything is displayed.
It consists of a navigation bar with just a logo and an input form for the address and obviously a submit button.
Whenever, a search is launched, the address information results are displayed inside the navigation bar below the form.
The form gets emptied, ready for another search.
In case, there is any error message to display (http error, etc), it is displayed below this bar as well.
The navigation bar is fixed and always visible on top especially when scrolling down to load additional transactions.

The body of the page includes the navigation bar and a "main" element that contains placeholders which are populated by JS.
The main blocks to display such as the address information or the transaction history list are based on html templates which are grouped in the this index.html file.
the javascript sript uses them to populate the data properly on the page.

##### style.css:
This file is quite light and only contains aesthetic feature that were easier to define here than finding them directly via bootstrap.
Most of the css features comes from bootstrap classes. 

##### javascript:

Initially, all js code was located in a single main.js but after 300 rows, I decided to split it to bring clarity in the project structure, making sure that concerns are well separated between functions.
Reoarganizing functions in the different js files helped me a lot to reorganize functions themselves with a clear separation of concerns. 

###### main.js: 
This is the main script referenced in the index.html.
It is very simple and just listens to the form submit.
When the form is submitted, the load initial transaction controller function is called.

###### controller.js:

This file regroups the controller functions.
These functions coordinate:
- The api call to the back-end (using the fetch nethod)
- the call to the render functions which return the html fragments
- DOM upates using appendChild method
- Update status variables (loading, last transaction called, etc)

There are 5 functions in the controller file:
- controllerLoadInitialTxs (called after form submit)
    - calls initNewSearch to clean from previous search
    - call the back-end api to retrieve the address-info and the 25 first transactions
    - modify the DOM to display results (using html templates in index.html)
    - call the adjustMainPadding function to adapt the navigation bar size
    - setup the observer for the infinite scroll functionality
    - update state variable to prepare for the next api call

- controllerLoadNextTxs (called when the bottom of the windows is reached after scroll down):
    - call the back-end api to retrieve the next 25 transactions
    - modify the DOM to display the next transaction results (using html templates in index.html)
    - disconnect obseerver in case no more transaction should be loaded

- initNewSearch (called by controllerLoadInitialTxs)
    - cleans UI
    - reset state variables

- adjustMainPadding (called by controllerLoadInitialTxs)
    - Update navigation bar size for UI purpose (avoid that the main section appears hidden below the navigation bar)
- setLoading:
    - Manages concurrent API call
    - Set UI loading wheel when back-end api is called

###### dom.js:

Reference all DOM elements used by the JS script and perform checks on their presence (once and for all)

###### state.js:

Reference all state variables updated by the JS script and used to ensure API call consistency

###### api.js:

Contains 2 API functions called by controllers:
- loadInitialTxs
- loadNextTxs

Both functions call a local fetchAndValidate function that calls the API using the url as input argument.
It returns a json from the back-end and validate its content. 

###### render.js:

Contains 3 functions called by controllers and building the HTML fragments based on the the HTML templates in index.html.
- renderAddressInfo for the address information
- renderTxHistory (+ render Tx used locally) for the transaction history
- showError for any error display on the UI page 

###### utils.js:

Contains utility functions:
- 2 formatting function for BTC / sats amount :
    - satsAmount
    - btcAmount
- validateData to functionnally validate the json content get from the API call
- set (a value in a selector inside an HTML fragment)
