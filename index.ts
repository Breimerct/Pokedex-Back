import app from './src/app'

async function main (): Promise<void> {
	await app.listen(app.get('port'))
}

main()
	.then(() => {
		console.log(`http://localhost:${app.get('port')}`)
	})
	.catch(err => {
		console.log('Error!', err)
	})
