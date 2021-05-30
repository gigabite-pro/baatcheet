var speechRecognition = window.webkitSpeechRecognition

var recognition = new speechRecognition()

var textbox = $('#textbox')

var instructions = $('#instructions')

var button = document.getElementById('button')

var content = ''

var output = document.getElementById('output')

recognition.continuous = true

recognition.onstart = function(){
    instructions.text('Listening...')
}

recognition.onspeechend = function(){
    instructions.text('No Activity')
}

recognition.onerror = function(){
    instructions.text(`Your browser doesn't support speech recognition. Try on Chrome.`)
}

recognition.onresult = function(event){
    instructions.text('Stopped')
    var current =  event.resultIndex;

    var transcript = event.results[current][0].transcript


    if(transcript == 'quotes' || transcript == 'quote'){
        fetch('https://api.quotable.io/random')
        .then(response => response.json())
        .then(data => {
            output.innerHTML = `<div class="quotes">
            <div class="col-12 text-center">
                ${data.content}
            </div>
            <div class="col-12 mt-3 text-center">
                - ${data.author}
            </div>
        </div>`
        })
    }else if(transcript == 'memes' || transcript == 'meme'){
        fetch('https://www.reddit.com/r/memes.json')
        .then(response => response.json())
        .then(body=>{
            for (let index = 0; index < body.data.children.length; index++) {
                if(body.data.children[index].data.post_hint == 'image'){
                    var memes = []
                    memes.push(body.data.children[index])
                }
                
            }

            let memeIndex = Math.floor(Math.random() * (memes.length - 0) + 0);
            output.innerHTML = `<img src="${memes[memeIndex].data.url_overridden_by_dest}" width="400">`
            output.style.height = 'fit-content'
        })
    }else if(transcript == 'movies' || transcript == 'movie'){
        movies = ['avengers', 'harry potter', 'friends', 'interstellar', 'mission impossible', 'inception', 'fast and furious']

        let movieIndex = Math.floor(Math.random() * (movies.length - 0) + 0);

        fetch(`https://api.themoviedb.org/3/search/movie?api_key=c467ddab940734b55111748d4ef3b4da&query=${movies[movieIndex]}&page=`)
        .then(async (result) => {
            const response = await result.json() 
            const results = response.results

            var newMovies = []
            
            results.forEach((m) => {
                if(m.poster_path != null && m.title != null) {
                    newMovies.push(m)
                }
            });
            let newMovieIndex = Math.floor(Math.random() * (3 - 0) + 0);
            output.innerHTML = `<img src="https://image.tmdb.org/t/p/w300${newMovies[newMovieIndex].poster_path}" width="200">`
            output.style.height = 'fit-content'
        })
    }

    content += transcript
     
    textbox.val(content)
}

textbox.on('input',function(){
    content = $(this).val()
})

var listening = false

button.addEventListener('click', function(event){
    if(listening == false){
        if(content.length){
            content = ''
        }
        
        textbox.val('')
        output.innerHTML = ``
        output.style.height = '20rem'
        button.innerHTML = 'Stop Listening'
        listening = true
        recognition.start()
    }else{
        recognition.stop()
        button.innerHTML = 'Start Listening'
        listening = false
    }
})