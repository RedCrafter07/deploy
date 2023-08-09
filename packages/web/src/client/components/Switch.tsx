import { useRef, useState } from 'react';

type CheckboxProps = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
>;

export default function Switch(
	props: CheckboxProps & { label: string; onChange?: (e: boolean) => void },
) {
	const { label, checked, defaultChecked, ...rest } = props;

	const checkbox = useRef<HTMLInputElement>(null);

	return (
		<div>
			<input
				type='checkbox'
				{...rest}
				className='hidden'
				onChange={(e) => props.onChange?.(e.target.checked)}
			/>

			<label
				htmlFor={props.id}
				className='flex items-center cursor-pointer w-max'
				onClick={() => {
					checkbox.current?.click();
				}}
			>
				<div className='relative'>
					<div
						className={`block ${
							checked ? 'bg-green-600' : 'bg-zinc-800'
						} w-10 h-6 rounded-full transition`}
					/>
					<div
						className={`dot absolute left-1 top-1 bg-zinc-100 w-4 h-4 rounded-full transition transform ${
							checked ? 'translate-x-4' : ''
						}`}
					></div>
				</div>
				{label && <div className='ml-3 font-medium select-none'>{label}</div>}
			</label>
		</div>
	);
}
