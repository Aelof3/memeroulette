/**
 * @description This is Meme Roulette. Load Random Memes
 * @param {Object} data
 */

class MemeRoulette {
    
    constructor( data ){
        //set basic properties
        this.subreddits = data.subreddits
        
        this.activeSubreddits = data.subreddits
        if ( typeof localStorage.getItem( 'memerouletteActiveSubreddits' ) === "string" ) {
            this.activeSubreddits = JSON.parse( localStorage.getItem( 'memerouletteActiveSubreddits' ) )
        }

        this.queryString = window.location.search
        this.urlParams = new URLSearchParams( this.queryString )
        this.wrapper = document.getElementById( 'wrapper' )
        this.cardcontent = document.getElementById( 'cardcontent' )
        this.head = document.querySelectorAll( 'head' )[ 0 ]
        this.now = new Date( ).getTime( )
        this.menuButton = document.getElementById( 'mememenubutton' )
        this.menuWrapper = document.getElementById( 'mememenu' )
        //this.ls = localStorage
        
        //check for previously loaded memes
        if ( typeof localStorage.getItem( 'memeroulette' ) === "string" ) {
            this.stored = JSON.parse( localStorage.getItem( 'memeroulette' ) )
        }
        
        //run the main function
        this.main( )
    }
    
    /**
     * @description console.log when debug is on
     */
    debugLog( data ) {
        let s = this
        if ( s.urlParams.has( 'debug' ) ) {
            console.log( data )
        }
    }

    /**
     * @description Update the localstorage with our list of urls for image srcs
     */
    updateLocalStorage( ) {
        let s = this
        //s.debugLog( 'line 44: updateLocalStorage' )
        localStorage.setItem( 'memeroulette', JSON.stringify( s.stored ) )
    }
    
    /**
     * @description Used for removing an img element if the src 404s. Checked via img size, where 404 images from reddit are 130x60
     * @param {Node} element
     */
    removeElement( element ) {
        let s = this
        //s.debugLog( 'line 54: removeElement' )
        element.remove( )
    }

    /**
     * @description See if the memes in storage are out of date. If out of date, empty list and load new memes
     */
    checkDate( ) {
        let s = this
        //s.debugLog( 'line 63: checkDate' )
        if ( typeof localStorage.getItem( 'memeroulette' ) === "string" ) {
            if ( s.stored.length > 1000 ) {
                //s.debugLog( 'line 66: s.stored over 10000 entries, resetting...' )
                s.resetUrls( )
            }
        }
        if ( typeof localStorage.getItem( 'memeroulettedate' ) === "string" ) {
            let lastupdate = localStorage.getItem( 'memeroulettedate' )
            if ( s.now - lastupdate > 600000 ) {
                //s.debugLog( s.now - lastupdate )
                //s.debugLog( 'line 73: Been over 10 minutes since last data purge. Purging now...' )
                s.resetUrls( )
            }
        } else {
            //s.debugLog( 'line 77: Setting Localstorage memeroulettedate' )
            localStorage.setItem( 'memeroulettedate', s.now )
        }  
    }

    /**
     * @description Empty the stored list of memes and set the urls to empty array
     */
    resetUrls( ) {
        let s = this
        //s.debugLog( 'line 87: resetUrls' )
        localStorage.removeItem( 'memeroulette' )
        localStorage.removeItem( 'memeroulettedate' )
        s.stored = []
    }

    /**
     * @description Get random integer up to max provided number
     * @param {Number} max
     * @returns {Number} - random integer from 0 up to provided number
     */
    getRandomInt( max ) {
        let s = this
        //s.debugLog( 'line 99: getRandomInt' )
        return Math.floor( Math.random( ) * Math.floor( max ) )
    }

    /**
     * @description Check extensions for content type from given url
     * @param {String} url
     * @returns {Object} - object used to determine whether or not to use the given url
     */
    checkType( url ) {
        let s = this
        //s.debugLog( 'line 109: checkType' )
        let x = { contentType: 'garbage', usable: false }
        if ( ( url.includes( '.jpg' ) || url.includes( '.png' ) || url.includes( '.jpeg' ) || url.includes( '.bmp' ) || ( url.includes( '.gif' ) && url.toLowerCase( ).indexOf( '.gifv' ) === -1 ) || url.includes( '.webp' ) ) && url.toLowerCase( ).indexOf( 'fbcdn' ) === -1 && url.toLowerCase( ).indexOf( 'makeameme.org' ) === -1 ) {
            x = { contentType: 'IMG', usable: true }
        }
        return x
    }
    
    /**
     * @description Converts string to html element
     * @param {String} html
     * @returns {Node} - element created from string
     */
    htmlToElement( html ) {
        let s = this
        //s.debugLog( 'line 124: htmlToElement' )
        let template = document.createElement( 'template' )
        html = html.trim( )
        template.innerHTML = html
        return template.content.firstChild
    }

    /**
     * @description Builds element from given object
     * @param {Object} data - contains the element type and src, and then also the element created
     * @returns {Node} - built element
     */
    buildElement( d ) {
        let s = this
        //s.debugLog( 'line 138: buildElement' )
        d.el = document.createElement( d.type )
        d.el.setAttribute( 'data-src', d.data.url )
        //if ( !( s.urlParams.has( 'type' ) ) ) {
        d.el.onload = ( ) => { s.checkImageSize( d.el ) }
        //}
        return d
    }

    /**
     * @description Checks the image size. Reddit 404 gives us a 130x60 image, so we have to check for that and load a new one
     * @param {String} source - source image element
     */
    checkImageSize( source ) {
        let s = this
        //s.debugLog( 'line 153: checkImageSize' )
        s.wrapper.setAttribute( 'class', 'card-image loaded' )
        if ( source.naturalWidth == 130 && source.naturalHeight == 60 && !( s.urlParams.has( 'type' ) ) ){
            s.spinTheWheel( )
        } else if ( source.naturalWidth == 130 && source.naturalHeight == 60 && ( s.urlParams.has( 'type' ) ) ){
            s.removeElement( source )
        } 
    }

    /**
     * @description Uses the data-src attribute to set the src of the image element. Done after onload is triggered to give us time to set onload/error functions
     * @param {Node} source - element of which to set the src
     */
    loaderFunc( source ) {
        let s = this
        //s.debugLog( 'line 168: loaderFunc' )
        let src = source.getAttribute( 'data-src' )
        source.setAttribute( 'src', src )
    }

    /**
     * @description Checks if given url is fit to be an image and then builds the element
     * @param {Object} data - the data with the url to validate and from which to build an element
     * @returns {Node} - built element, or false
     */
    getContent( data ) {
        let s = this
        //s.debugLog( 'line 180: getContent' )
        let checkedType = s.checkType( data.url )
        let d = ( checkedType.usable ) ? s.buildElement( { data: data, type: checkedType.contentType } ) : false
        return d
    }

    /**
     * @description Stores the newly fetched urls in our class, and then updates the local storage with the entire list, filtered for unique urls
     * @param {Object} data - contains the element type and src, and then also the element created
     */
    storeUrls( data ){
        let s = this
        //s.debugLog( 'line 192: storeUrls' )
        if ( typeof s.stored === "object" ) {
            for ( let i=0; i < data.length; i++ ) {
                if ( typeof data[ i ][ 'url' ] === "string" ) { 
                    s.stored.push( { link: data[ i ].full_link, user: data[ i ].author, url: data[ i ].url, title: data[ i ].title, subreddit: data[ i ].subreddit } )
                }
            }
            //s.debugLog( 'pushing new objects into stored data' ); //s.debugLog( s.stored );
        } else {
            s.stored = []
            for ( let i=0; i < data.length; i++ ) {
                if ( data[ i ][ 'url' ] !== undefined ) { 
                    s.stored.push( { link: data[ i ].full_link, user: data[ i ].author, url: data[ i ].url, title: data[ i ].title, subreddit: data[ i ].subreddit } )
                }
            }
            //s.debugLog( 'line 207: created new stored object', s.stored )
        }
        //s.stored = s.stored.filter( (value, index, self) => { return self.indexOf( value.url ) === index } )
        s.updateLocalStorage( )
    }

    /**
     * @description Spins the wheel without running the fetch for more urls
     */
    localSpin( ) {
        let s = this
        //s.debugLog( 'line 219: localSpin' )
        let spun = false
        if ( typeof localStorage.getItem( 'memeroulette' ) === "string" ) {
            let b = true
            while ( b ) {
                let d = s.getContent( s.stored[ s.getRandomInt( s.stored.length - 1 ) ] )
                if ( d !== false ) {
                    s.wrapper.innerHTML = ''
                    s.wrapper.appendChild( d.el )
                    s.cardcontent.innerHTML = ''
                    let memdesc = s.htmlToElement( `<div class="memedesc"></div>` )
                    let memuser = s.htmlToElement( `<a target="_blank" class="userlink" href="https://www.reddit.com/user/${ d.data.user }/">u/${ d.data.user }</a>` )
                    let memsub = s.htmlToElement( `<a class="memesubreddit" target="_blank" href="https://reddit.com/r/${ d.data.subreddit }">r/${ d.data.subreddit }</a>` )
                    let memwheel = s.htmlToElement( `<div id="memewheel" class="memewheel waves-effect waves-light btn"><i class="material-icons right">loop</i>Spin the Wheel</div>` )
                    memdesc.appendChild( memuser )
                    memdesc.appendChild( memsub )
                    memwheel.ontouchend = ( ) => { s.spinTheWheel( ) }
                    memwheel.onclick = ( ) => { s.spinTheWheel( ) }
                    memdesc.appendChild( memwheel )
                    s.cardcontent.appendChild( memdesc )
                    s.cardcontent.appendChild( s.htmlToElement( `<div class="memetitlewrap">
                                                    <a class="memetitle" target="_blank" href="${ d.data.link }">${ d.data.title }</a>
                                                </div>` ) )
                    s.loaderFunc( d.el )
                    b = false
                    break
                }
            }
            spun = true
        } else {
            spun = false
        }
        return spun
    }

    /**
     * @description Spin the wheel for a random meme. Fetches list of 1000 meme image urls and adds them to our local storage cache
     */
    spinTheWheel( ) {
        let s = this
        //s.debugLog( 'line 258: updateLocalStorage' )
        s.checkDate( )
        let spun = s.localSpin( )    
        fetch( `https://api.pushshift.io/reddit/search/submission/?subreddit=${ s.activeSubreddits[ s.getRandomInt( s.activeSubreddits.length - 1 ) ] }&size=100` ).then( ( r ) => {
            r.text( ).then( ( rr ) => {
                console.log("inside fetch")
                let json_var = JSON.parse( rr )
                s.storeUrls( json_var.data )
                if ( spun === false ){
                    s.localSpin( )
                }
            } )
        } )

        console.log("after fetch")
    }

    /**
     * @description Onload function for image elements to load more images when type is set to list
     * @param {Number} d
     *
    imgLoad( d ) {
        let s = this
        let urls = JSON.parse( localStorage.getItem( 'memeroulette' ) )
        let elem = s.getContent( urls[ d ] )
        if ( elem !== false ) {
            elem.onload = ( ) => { s.imgLoad( d + 1 ); s.checkImageSize( elem ); }
            elem.setAttribute( 'class', 'listItem' )
            s.wrapper.appendChild( elem )
            s.loaderFunc( elem )
        } else {
            s.imgLoad( d + 1 )
        }
    }
    */
    toggleMenu( ) {
        let s = this
        s.menuWrapper.classList.toggle( 'hidemenu' )
        s.menuWrapper.classList.toggle( 'showmenu' )
    }

    updateSubredditStorage( ){
        let s = this
        let activeSubredditEls = s.menuItems.filter( item => { return item.classList.contains( 'active' ) } )
        s.activeSubreddits = activeSubredditEls.map( el => { return el.getAttribute( 'data-subreddit' ) } )
        localStorage.setItem( 'memerouletteActiveSubreddits', JSON.stringify( s.activeSubreddits ) )
        localStorage.removeItem( 'memeroulette' )
        localStorage.removeItem( 'memeroulettedate' )
        s.store = []
    }

    updateSubredditList( ) {
        let s = this
        s.menuItems = s.subreddits.map( subreddit => { return s.htmlToElement( `<a href="#" data-subreddit="${ subreddit }" class="collection-item ${ s.activeSubreddits.includes( subreddit ) ? 'active':'' }">${ subreddit }<i class="material-icons right">check_circle</i></a>`) } )
        s.menuWrapper.innerHTML = ''
        for ( let i=0; i < s.menuItems.length; i++ ) {
            s.menuItems[ i ].onclick = ( e ) => {
                e.preventDefault( )
                s.menuItems[ i ].classList.toggle( 'active' )
                s.updateSubredditStorage( )
            }
            s.menuItems[ i ].ontouchend = ( e ) => {
                e.preventDefault( )
                s.menuItems[ i ].classList.toggle( 'active' )
                s.updateSubredditStorage( )
            }
            s.menuWrapper.appendChild( s.menuItems[ i ] )
        }
        s.updateSubredditStorage( )
    }

    /**
     * @description subreddit menu setup and event handlers
     */
    menuSetup( ) {
        let s = this
        s.menuButton.onclick = ( e ) => {
            e.preventDefault( )
            s.toggleMenu( )
        }
        s.menuButton.ontouchend = ( e ) => {
            e.preventDefault( )
            s.toggleMenu( )
        }
        s.updateSubredditList( )
    }

    /**
     * @description The main loop
     * Checks to see if Chris has set user to oraclefish to load his stylesheet
     * Checks to see if lang is set to 2nd for netherlands subreddits
     * Checks to see if type is set to list to load all cached memes sequentially
     * Sets event handlers for loading new memes
     */
    main( ) {
        let s = this
        s.menuSetup( )
        //s.debugLog( 'line 299: updateLocalStorage' )
        if ( s.urlParams.has( 'user' ) ) {
            let user = s.urlParams.get( 'user' ).replace( /[^A-Za-z]/, '' )
            let h = s.htmlToElement( `<link rel="stylesheet" type="text/css" href="css/${ user }style.css"></link>` )
            s.head.appendChild( h )
        }
        /*if ( s.urlParams.has( 'type' ) ) {
            let type = s.urlParams.get( 'type' )
            if ( type === 'list' ){
                s.wrapper.innerHTML = ''
                s.imgLoad( 0 )
            }
        } else {*/
            window.onkeypress = ( e ) => {
                if (e.keyCode == 13) {
                    s.wrapper.setAttribute( 'class', 'card-image loading' )
                    //setTimeout( s.spinTheWheel( ), 200 )
                    s.spinTheWheel( )
                }
            }
            s.spinTheWheel( )
        //}
    }
}

const data = {
    "subreddits":[
        "facepalm",
        "CrappyDesign",
        "MildlyVandalized",
        "wholesomememes",
        "AdviceAnimals",
        "memes",
        "dankmemes",
        "2meirl4meirl",
        "DeepFriedMemes",
        "surrealmemes",
        "historymemes",
        "i_irl", 
        "meirl", 
        "me_irl", 
        "memeeconomy", 
        "bikinibottomtwitter", 
        "trippinthroughtime", 
        "anime_irl", 
        "data_irl", 
        "blackpeopletwitter", 
        "whitepeopletwitter", 
        "boottoobig", 
        "bonehurtingjuice", 
        "dankchristianmemes", 
        "fakehistoryporn", 
        "musicmemes", 
        "kenm", 
        "meow_irl", 
        "woof_irl", 
        "prequelmemes", 
        "sequelmemes", 
        "OTmemes", 
        "youdontsurf", 
        "starterpacks",
        "coaxedintoasnafu",
        "lewronggeneration",
        "indianpeoplefacebook",
        "im14andthisisdeep",
        "comedycemetery",
        "pewdiepiesubmissions",
        "cirkeltrek",
        "ik_ihe"
    ]
}

let m = new MemeRoulette( data )

