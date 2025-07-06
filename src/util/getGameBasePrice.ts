export default function getGameBasePrice(): string | undefined {
    let priceElement = document.querySelector('.discount_original_price')
    
    if (!priceElement || !priceElement.innerHTML.trim()) {
        priceElement = document.querySelector('.price')
    }
    
    console.log('Base Price', priceElement?.innerHTML)
    return priceElement?.innerHTML
}