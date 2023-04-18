

export const getUtcTime=(timeinstance:string)=>{
return (new Date(timeinstance)).toUTCString()
}


export const getUtcTimeformated=(timeinstance:any)=>{
    timeinstance= new Date(timeinstance);
    console.log('date:',{timeinstance})
    var tail= '', D= [ timeinstance.getUTCDate(), timeinstance.getUTCMonth()+1,timeinstance.getUTCFullYear()],
    T= [timeinstance.getUTCHours(), timeinstance.getUTCMinutes()];
    if(+T[0]> 12){
        T[0]-= 12;
        tail= ' pm '+tail;
    }
    else tail= ' am '+tail;
    var i= 3;
    while(i){
        --i;
        if(D[i]<10) D[i]= '0'+D[i];
        if(T[i]<10) T[i]= '0'+T[i];
    }
    return D.join('/')+' '+T.join(':')+ tail;

   
}