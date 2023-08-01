import React from 'react';

export default function Spinner() {
	return (
		<div
			className='w-full aspect-square border-4 rounded-full animate-spin'
			style={{
				borderColor: '#fff transparent #fff transparent',
			}}
		/>
	);
}
