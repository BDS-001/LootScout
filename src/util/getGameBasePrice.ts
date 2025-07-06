export default function getGameBasePrice(): number | null{
    let priceElement = document.querySelector('.discount_original_price')
    
    if (!priceElement || !priceElement.innerHTML.trim()) {
        priceElement = document.querySelector('.price')
    }
    
    const price = parseFloat(priceElement?.innerHTML ?? '')
    console.log('Base Price', priceElement?.innerHTML)
    return isNaN(price) ? null : price
}