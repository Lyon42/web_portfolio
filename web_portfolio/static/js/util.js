export function getElementHeight(element)
{
    element = (typeof element === 'string') ? document.querySelector(element) : element;
    const styles = window.getComputedStyle(element);
    const margin = parseFloat(styles['marginTop']) + parseFloat(styles['marginBottom']);
    return Math.ceil(element.offsetHeight + margin);
}

export function callFunctionByName(functionName)
{
    const namespaces = functionName.split(".");
    const func = namespaces.pop();
    let context = window;

    for(let i = 0; i < namespaces.length; i++)
    {
        context = context[namespaces[i]]
    }

    return context[func].apply(context)
}