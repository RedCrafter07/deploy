import { useRef } from 'react';

type CheckboxProps = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
>;

export default function Switch(props: CheckboxProps & { label: string }) {
	const { label } = props;

	const checkbox = useRef<HTMLInputElement>(null);

	return (
		<div>
			<input type='checkbox' className='hidden' ref={checkbox} />

			<div
				className='rounded-full p-2 w-14 h-8 bg-zinc-800'
				onClick={() => {
					checkbox.current?.click();
				}}
			>
				<div
					className={`bg-zinc-700 rounded-full w-6 h-6 ${
						checkbox.current?.checked ? 'ml-6' : ''
					}`}
				/>
			</div>

			<label className='ml-2'>{label}</label>
		</div>
	);
}
