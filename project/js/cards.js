
const postsContainer = document.querySelector('.posts-container')

const getPosts = async () => {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts')
        const data = await response.json()

        data.forEach((post) => {
            const postCard = document.createElement('div')

            postCard.classList.add('post-card')

            postCard.innerHTML = `
                <span>Post #${post.id}</span>
                <h3>${post.title}</h3>
                <p>${post.body}</p>
                <small>User ID: ${post.userId}</small>
            `

            postsContainer.append(postCard)
        })

    } catch (error) {
        console.log(error)
    }
}

getPosts()
