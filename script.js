let CurrentAlbum;
let Songs;
let audio = new Audio();

const SecToMinSec = (sec) => {
    if (isNaN(sec) || sec <= 0) {
        return "00:00"
    }
    else {
        let minu = Math.floor(sec / 60)
        let remainsec = Math.floor(sec % 60)

        let minustr = (minu < 10) ? `0${minu}` : minu
        let RimSecstr = (remainsec < 10) ? `0${remainsec}` : remainsec
        return `${minustr}:${RimSecstr}`
    }
}



async function getAlbums() {  //just to show the album cards and add event listner to those cards
    let a = await fetch(/songs/)
    // console.log(a)
    let response = await a.text() //contains data about the files stored inside songs folder, the name of the folder is stored in title , but it is in html format, so to fetch data out of it  we need to put it in a html element
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    // console.log(div)
    let anc = Array.from(div.getElementsByTagName("a")).filter(ele => ele.href.includes("/songs/")) //div.getElementByTagName returns a set of all elements(a) inside the div, so first make it an array to be useable, then filter that array to store only the elements with /songs/ in their href
    // console.log(anc)
    for (let i = 0; i < anc.length; i++) {
        let folder = anc[i].href.split("/")[4]  //now cycle between all elements of anc array and store those in folder variable to use them, but slice the url bt "/" so it will return a array of 4 elemnts, just store the 4th one
        // console.log(folder)
        let b = await fetch(`/songs/${folder}/info.json`) //fetching the contents from inside the folder
        // console.log(b)
        let meta_data = await b.json()
        // console.log(b)
        let playlists = document.querySelector(".playlists")
        playlists.innerHTML += `
        <div class="card" data-folder= "${folder}">
                <img src="/songs/${folder}/cover.jpg" alt="">
                <img src="vanishing play.svg" alt="" id="vanish">
                <span style="font-weight: bold;">${meta_data.title}</span>
                <span style="font-size: 12px;">${meta_data.Artist}</span>
            </div>`

        let side_library = document.querySelector(".display_playlist")
        side_library.innerHTML += `<div class="library_list" data-folder= "${folder}">
        <img src="/songs/${folder}/cover.jpg" alt="">
        <div class="library_text">
            <div>${meta_data.title}</div>
            <div>${meta_data.Artist}</div>
        </div>
    </div>`
    }


    //Add eventlistner to each cards
    //document.getElemntByClassName returns a set of 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("fetching songs...")
            // console.log(`${decodeURI(item.currentTarget.dataset.folder)}`)
            // console.log(typeof(decodeURIComponent(item.currentTarget.dataset.folder)))
            // console.log(item)
            document.querySelector(".con1").style.display = "none"
            document.querySelector(".con2").style.display = "block"
            await getSongs(`${decodeURI(item.currentTarget.dataset.folder)}`)
        })
    })
    Array.from(document.getElementsByClassName("library_list")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("fetching songs...")
            // console.log(`${decodeURI(item.currentTarget.dataset.folder)}`)
            // console.log(typeof(decodeURIComponent(item.currentTarget.dataset.folder)))
            // console.log(item)
            document.querySelector(".con1").style.display = "none"
            document.querySelector(".con2").style.display = "flex"
            await getSongs(`${decodeURI(item.currentTarget.dataset.folder)}`)
        })
    })
}

async function getSongs(folder1) {
    CurrentAlbum = folder1
    let folder = encodeURI(folder1)
    let a = await fetch(`/songs/${folder}/`)
    // console.log(a)
    let div = document.createElement("div")
    div.innerHTML = await a.text()
    // console.log(div)
    let Song_list = Array.from(div.getElementsByTagName("a")).filter(ele => ele.href.endsWith(".mp3"))
    // console.log(Song_list)
    Songs = Song_list.map(ele => ele.href.split(`/${folder}/`)[1])
    // console.log(Songs[0])

    let song_list = document.querySelector(".song_list")
    song_list.innerHTML = '';
    for (const item of Songs) {
        song_list.innerHTML += `<div class="song">
                <span>${Songs.indexOf(item) + 1}</span>
                <img src="music.svg" alt="">
                <span class= "songuril">${decodeURI(item)}</span>
                <img src="play.svg" alt="" class="play2">
                <img src="pause.svg" alt="" class="pause2">
            </div>`
    }


    let b = await fetch(`/songs/${folder}/info.json`)
    let obj = await b.json()
    albumimage.src = `/songs/${folder}/cover.jpg`
    albumname.innerHTML = `${obj.title}`
    albumdetails.innerHTML = `${obj.Artist}`
    totalsongs.innerHTML = `${Songs.length} Songs`



    //add event listner to each songs
    Array.from(document.getElementsByClassName("song")).forEach(ele => {
        ele.addEventListener("click", async item => {
            // console.log("fatching the song data...")
            // console.log(encodeURI(ele.querySelector("span").innerHTML))
            // playMusic(encodeURI(ele.querySelector("span").innerHTML))

            if (audio.src.includes(encodeURI(ele.querySelector(".songuril").innerHTML)) && !audio.paused) {
                audio.pause()
                // ele.querySelector(".play2").style.display = "block"
                // ele.querySelector(".pause2").style.display = "none"
                play.style.display = "block"
                pause.style.display = "none"
            }
            else if (audio.src.includes(encodeURI(ele.querySelector(".songuril").innerHTML)) && audio.paused) {
                audio.play()
                // ele.querySelector(".play2").style.display = "none"
                // ele.querySelector(".pause2").style.display = "block"
                play.style.display = "none"
                pause.style.display = "block"
            }
            else {
                playMusic(encodeURI(ele.querySelector(".songuril").innerHTML))
                // ele.querySelector(".play2").style.display = "none"
                // ele.querySelector(".pause2").style.display = "block"
                play.style.display = "none"
                pause.style.display = "block"
            }


        })
    })


    // Array.from(document.getElementsByClassName("song")).forEach(ele => {
    //     ele.addEventListener("click", (event) => {
    //         if(audio.src.split("/")[2] == ele.querySelector(span).innerHTML){
    //             audio.pause()
    //         }
    //     });
    // })

    return Songs;
}


const playMusic = (SongUrl) => {
    let folder = encodeURI(CurrentAlbum)
    audio.src = `/songs/${folder}/` + SongUrl

    audio.addEventListener('loadedmetadata', function () {
        // Audio metadata, including duration, has been fully loaded
        let duration = document.querySelector(".Duration")
        // duration.innerHTML = audio.duration()
        console.log(audio.duration);
        // Update duration display or perform other actions
    });

    document.querySelector(".showinfo").innerHTML = decodeURI(audio.src.split("/")[5])
    audio.play();

    let duration = document.querySelector(".Duration")
    // duration.innerHTML = audio.duration()
    console.log(audio.duration);

}


const pause_audio = () => {
    audio.pause()
}



async function main() {
    await getSongs("Happy")
    let a = await getAlbums()
    audio.src = `/songs/${encodeURI(CurrentAlbum)}/` + Songs[0]
    document.querySelector(".showinfo").innerHTML = decodeURI(audio.src.split("/")[5])



    audio.addEventListener('play', () => {
        play.style.display = "none";
        pause.style.display = "block";
    });

    audio.addEventListener('pause', () => {
        play.style.display = "block";
        pause.style.display = "none";
    });

    arrowleft.addEventListener("click" , ()=>{
        document.querySelector(".con1").style.display = "flex"
            document.querySelector(".con2").style.display = "none"
    })

    //adding event listner to play/pause button
    play.addEventListener("click", () => {
        audio.play()
        play.style.display = "none"
        pause.style.display = "block"

    })
    pause.addEventListener("click", () => {
        audio.pause()
        play.style.display = "block"
        pause.style.display = "none"
    })
    audio.addEventListener('ended', () => {
        play.style.display = "block";
        pause.style.display = "none";
    });

    //add event listner to previous and next buttons
    previous.addEventListener("click", (e) => {
        audio.pause()
        let index = Songs.indexOf(audio.src.split("/")[5])
        if ((index - 1) >= 0) {
            playMusic(decodeURI(Songs[index - 1]))
        }
    })
    next.addEventListener("click", (e) => {
        audio.pause()
        let index = Songs.indexOf(audio.src.split("/")[5])
        if ((index + 1) < Songs.length) {
            playMusic(decodeURI(Songs[index + 1]))
        }
    })

    //work on seekbar
    //update seekbar with time
    audio.addEventListener("timeupdate", (e) => {
        document.querySelector(".CurrentTime").innerHTML = SecToMinSec(audio.currentTime)
        document.querySelector(".Duration").innerHTML = SecToMinSec(audio.duration)
        document.getElementById('seek').value = audio.currentTime / audio.duration * 100
    })


    //take input from seekbar and change audio's currenttime
    document.getElementById('seek').addEventListener("change", (event) => {
        audio.currentTime = audio.duration * event.target.value / 100
    })


    //volume controls
    document.getElementById('volumebar').addEventListener("change", (event) => {
        // console.log(event , event.target , event.target.value)
        audio.volume = event.target.value / 100
        if (event.target.value == 0) {
            volume.style.display = "none"
            noVolume.style.display = "block"

        }
        else {
            volume.style.display = "block"
            noVolume.style.display = "none"
        }
    })
    document.getElementById("volume").addEventListener("click", () => {
        audio.volume = 0;
        volumebar.value = 0;
        volume.style.display = "none"
        noVolume.style.display = "block"
    })
    document.getElementById("noVolume").addEventListener("click", () => {
        audio.volume = 0.1;
        volumebar.value = 10;
        volume.style.display = "block"
        noVolume.style.display = "none"
    })
}
main()